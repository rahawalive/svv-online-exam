const express = require("express");
const helmet = require("helmet");
const path = require("path");

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Minimal in-memory data (demo only)
const state = {
  exams: [
    {
      id: "EXAM-1",
      status: "Published",
      deadline: Date.now() + 60 * 60 * 1000, // 1 hour from start
      questions: [
        { id: "Q1", text: "2 + 2 = ?" },
        { id: "Q2", text: "Capital of Pakistan?" }
      ]
    }
  ],
  attempts: [] // { studentId, examId, status, answers: { [qid]: value } }
};

function getExam(examId) {
  return state.exams.find((e) => e.id === examId);
}

function getAttempt(studentId, examId) {
  return state.attempts.find((a) => a.studentId === studentId && a.examId === examId);
}

app.get("/health", (req, res) => res.json({ ok: true }));

// Expose questions for a specific exam
app.get("/api/exams/:examId/questions", (req, res) => {
  const exam = getExam(req.params.examId);
  if (!exam) return res.status(404).json({ error: "exam not found" });
  res.json(exam.questions);
});

app.get("/api/exams", (req, res) => {
  res.json(
    state.exams.map((e) => ({
      id: e.id,
      status: e.status,
      deadline: e.deadline,
      questionCount: e.questions.length
    }))
  );
});

// Start attempt
app.post("/api/exams/:examId/start", (req, res) => {
  const examId = req.params.examId;
  const studentId = String(req.body?.studentId || "");
  if (!studentId) return res.status(400).json({ error: "studentId required" });

  const exam = getExam(examId);
  if (!exam) return res.status(404).json({ error: "exam not found" });
  if (exam.status !== "Published") return res.status(409).json({ error: "exam not published" });

  const existing = getAttempt(studentId, examId);
  if (existing) return res.status(409).json({ error: "attempt already exists", attempt: existing });

  const attempt = { studentId, examId, status: "InProgress", answers: {} };
  state.attempts.push(attempt);
  res.json({ ok: true, attempt });
});

// Save answer
app.post("/api/exams/:examId/answer", (req, res) => {
  const examId = req.params.examId;
  const studentId = String(req.body?.studentId || "");
  const questionId = String(req.body?.questionId || "");
  const value = String(req.body?.value ?? "");
  if (!studentId || !questionId) return res.status(400).json({ error: "studentId and questionId required" });

  const exam = getExam(examId);
  if (!exam) return res.status(404).json({ error: "exam not found" });

  const attempt = getAttempt(studentId, examId);
  if (!attempt) return res.status(404).json({ error: "attempt not found" });
  if (attempt.status !== "InProgress") return res.status(409).json({ error: "attempt not in progress" });

  const qExists = exam.questions.some((q) => q.id === questionId);
  if (!qExists) return res.status(404).json({ error: "question not found" });

  attempt.answers[questionId] = value;
  res.json({ ok: true, attempt });
});

// Submit attempt (deadline-based)
app.post("/api/exams/:examId/submit", (req, res) => {
  const examId = req.params.examId;
  const studentId = String(req.body?.studentId || "");
  if (!studentId) return res.status(400).json({ error: "studentId required" });

  const exam = getExam(examId);
  if (!exam) return res.status(404).json({ error: "exam not found" });

  const attempt = getAttempt(studentId, examId);
  if (!attempt) return res.status(404).json({ error: "attempt not found" });
  if (attempt.status !== "InProgress") return res.status(409).json({ error: "attempt not in progress" });

  if (Date.now() > exam.deadline) return res.status(409).json({ error: "deadline passed" });

  attempt.status = "Submitted";
  res.json({ ok: true, attempt });
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Prototype running on http://localhost:${port}`);
});

