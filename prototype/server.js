const express = require("express");
const helmet = require("helmet");
const path = require("path");

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// In-memory data (demo only)
const state = {
  exams: [
    {
      id: "EXAM-1",
      title: "Software Verification & Validation",
      subject: "SVV",
      status: "Published",
      deadline: Date.now() + 2 * 60 * 60 * 1000, // 2 hours
      questions: [
        { id: "Q1",  text: "What is the difference between Verification and Validation in software engineering?" },
        { id: "Q2",  text: "Define a formal method. Give two examples of formal specification languages." },
        { id: "Q3",  text: "What is Z Notation? Describe its main components: schema, state, and operations." },
        { id: "Q4",  text: "Explain the purpose of preconditions and postconditions in VDM-SL operations." },
        { id: "Q5",  text: "What is Alloy Analyzer? How does it differ from Z Notation in terms of verification approach?" },
        { id: "Q6",  text: "What is a counterexample in Alloy? Why is finding one considered useful during model development?" },
        { id: "Q7",  text: "State and explain the Single Attempt Rule in the context of an online examination system." },
        { id: "Q8",  text: "What is OWASP ZAP? What types of vulnerabilities does it detect in web applications?" },
        { id: "Q9",  text: "Explain the role of a CI/CD pipeline in a software verification project. What does GitHub Actions provide?" },
        { id: "Q10", text: "What is a defect taxonomy? List three types of requirement defects and give an example of each." }
      ]
    },
    {
      id: "EXAM-2",
      title: "Object-Oriented Programming",
      subject: "OOP",
      status: "Published",
      deadline: Date.now() + 2 * 60 * 60 * 1000, // 2 hours
      questions: [
        { id: "Q1",  text: "What are the four pillars of Object-Oriented Programming? Briefly explain each." },
        { id: "Q2",  text: "What is the difference between a class and an object? Give a real-world example." },
        { id: "Q3",  text: "Explain method overloading vs method overriding with examples." },
        { id: "Q4",  text: "What is an abstract class? How does it differ from an interface?" },
        { id: "Q5",  text: "What is the 'this' keyword in OOP? When and why is it used?" },
        { id: "Q6",  text: "Explain the concept of constructor chaining. Why is it useful?" },
        { id: "Q7",  text: "What is polymorphism? Describe compile-time and runtime polymorphism with examples." },
        { id: "Q8",  text: "What is encapsulation? How do access modifiers (public, private, protected) support it?" },
        { id: "Q9",  text: "What is the difference between shallow copy and deep copy of an object?" },
        { id: "Q10", text: "What are design patterns? Name and briefly describe three commonly used design patterns." }
      ]
    },
    {
      id: "EXAM-3",
      title: "Database Management Systems",
      subject: "DBMS",
      status: "Published",
      deadline: Date.now() + 2 * 60 * 60 * 1000, // 2 hours
      questions: [
        { id: "Q1",  text: "What is a DBMS? How does it differ from a file-based storage system?" },
        { id: "Q2",  text: "Explain the difference between DDL, DML, and DCL in SQL with examples." },
        { id: "Q3",  text: "What is normalization? Explain 1NF, 2NF, and 3NF with examples." },
        { id: "Q4",  text: "What is a primary key? How does it differ from a foreign key?" },
        { id: "Q5",  text: "Explain the concept of ACID properties in database transactions." },
        { id: "Q6",  text: "What is a JOIN in SQL? Describe INNER JOIN, LEFT JOIN, and RIGHT JOIN." },
        { id: "Q7",  text: "What is an index in a database? How does it improve query performance?" },
        { id: "Q8",  text: "What is the difference between a clustered and a non-clustered index?" },
        { id: "Q9",  text: "Explain the ER (Entity-Relationship) model. What are entities, attributes, and relationships?" },
        { id: "Q10", text: "What is a stored procedure? How does it differ from a function in SQL?" }
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
      title: e.title,
      subject: e.subject,
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

