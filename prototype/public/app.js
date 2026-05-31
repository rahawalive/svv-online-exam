/* ── State ── */
const app = {
  studentId: null,
  currentExam: null,
  currentAttempt: null,
  questions: [],
  answers: {},
  timerInterval: null,
  deadline: null,
};

/* ── Page routing ── */
function showPage(id) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* ── Login ── */
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const studentId = document.getElementById("student-id").value.trim();
  const errEl = document.getElementById("login-error");
  errEl.classList.add("hidden");

  if (!studentId) {
    errEl.textContent = "Please enter your Student ID.";
    errEl.classList.remove("hidden");
    return;
  }

  app.studentId = studentId;
  document.getElementById("topbar-student").textContent = `👤 ${studentId}`;
  showPage("page-dashboard");
  loadDashboard();
});

/* ── Logout ── */
document.getElementById("logout-btn").addEventListener("click", () => {
  clearInterval(app.timerInterval);
  app.studentId = null;
  app.currentExam = null;
  app.currentAttempt = null;
  document.getElementById("student-id").value = "";
  document.getElementById("password").value = "";
  showPage("page-login");
});

/* ── Dashboard ── */
async function loadDashboard() {
  const container = document.getElementById("exam-list");
  container.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div>';

  try {
    const res = await fetch("/api/exams");
    const exams = await res.json();
    renderExamCards(exams);
  } catch {
    container.innerHTML = '<p style="color:red">Failed to load exams. Is the server running?</p>';
  }
}

function renderExamCards(exams) {
  const container = document.getElementById("exam-list");
  if (!exams.length) {
    container.innerHTML = "<p>No exams available.</p>";
    return;
  }

  container.innerHTML = exams.map((exam) => {
    const deadline = new Date(exam.deadline).toLocaleString();
    const isPast = Date.now() > exam.deadline;
    const statusBadge = isPast
      ? '<span class="badge badge-closed">Closed</span>'
      : '<span class="badge badge-published">Published</span>';

    return `
      <div class="exam-card">
        <div class="exam-card-header">
          <span class="exam-card-title">${exam.id}</span>
          ${statusBadge}
        </div>
        <div class="exam-meta">
          <span>📋 ${exam.questionCount} question${exam.questionCount !== 1 ? "s" : ""}</span>
          <span>⏰ Deadline: ${deadline}</span>
        </div>
        <button
          class="btn ${isPast ? "btn-ghost" : "btn-outline"}"
          onclick="startExam('${exam.id}')"
          ${isPast ? "disabled" : ""}
        >
          ${isPast ? "Exam Closed" : "Start Exam →"}
        </button>
      </div>
    `;
  }).join("");
}

/* ── Start Exam ── */
async function startExam(examId) {
  try {
    const res = await fetch(`/api/exams/${examId}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: app.studentId }),
    });
    const data = await res.json();

    if (!res.ok) {
      if (data.error === "attempt already exists") {
        // Resume existing attempt
        app.currentAttempt = data.attempt;
      } else {
        alert("Error: " + data.error);
        return;
      }
    } else {
      app.currentAttempt = data.attempt;
    }

    // Fetch exam details for questions
    const examsRes = await fetch("/api/exams");
    const exams = await examsRes.json();
    const exam = exams.find((e) => e.id === examId);
    if (!exam) { alert("Exam not found."); return; }

    app.currentExam = exam;
    app.questions = await fetchQuestions(examId);
    app.answers = { ...app.currentAttempt.answers };
    app.deadline = exam.deadline;

    renderExamPage();
    showPage("page-exam");
    startTimer();
  } catch (err) {
    alert("Failed to start exam: " + err.message);
  }
}

async function fetchQuestions(examId) {
  // Questions come from the exam list endpoint (questionCount only),
  // so we use the server's internal questions via a dedicated endpoint we'll add,
  // or fall back to the start response. We expose them via /api/exams/:id/questions.
  try {
    const res = await fetch(`/api/exams/${examId}/questions`);
    if (res.ok) return await res.json();
  } catch {}
  return [];
}

/* ── Render Exam ── */
function renderExamPage() {
  document.getElementById("exam-title").textContent = app.currentExam.id;

  const panel = document.getElementById("questions-panel");
  const nav = document.getElementById("question-nav");

  panel.innerHTML = app.questions.map((q, i) => `
    <div class="question-card ${app.answers[q.id] ? "answered" : ""}" id="qcard-${q.id}">
      <div class="question-num">Question ${i + 1} of ${app.questions.length}</div>
      <div class="question-text">${escapeHtml(q.text)}</div>
      <textarea
        class="answer-input"
        placeholder="Type your answer here…"
        id="ans-${q.id}"
        oninput="saveAnswer('${q.id}', this.value)"
      >${escapeHtml(app.answers[q.id] || "")}</textarea>
    </div>
  `).join("");

  nav.innerHTML = app.questions.map((q, i) => `
    <button
      class="q-nav-btn ${app.answers[q.id] ? "answered" : ""}"
      id="nav-${q.id}"
      onclick="scrollToQuestion('${q.id}')"
      title="Question ${i + 1}"
    >${i + 1}</button>
  `).join("");

  updateProgress();
}

/* ── Save Answer ── */
async function saveAnswer(questionId, value) {
  app.answers[questionId] = value;
  updateProgress();

  // Update card and nav button style
  const card = document.getElementById(`qcard-${questionId}`);
  const navBtn = document.getElementById(`nav-${questionId}`);
  if (value.trim()) {
    card?.classList.add("answered");
    navBtn?.classList.add("answered");
  } else {
    card?.classList.remove("answered");
    navBtn?.classList.remove("answered");
  }

  // Persist to server
  try {
    await fetch(`/api/exams/${app.currentExam.id}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: app.studentId, questionId, value }),
    });
  } catch {}
}

/* ── Progress ── */
function updateProgress() {
  const total = app.questions.length;
  const answered = app.questions.filter((q) => app.answers[q.id]?.trim()).length;
  const pct = total ? (answered / total) * 100 : 0;
  document.getElementById("progress-bar").style.width = pct + "%";
  document.getElementById("progress-text").textContent = `${answered} / ${total} answered`;
}

/* ── Timer ── */
function startTimer() {
  clearInterval(app.timerInterval);
  updateTimerDisplay();
  app.timerInterval = setInterval(() => {
    updateTimerDisplay();
    if (Date.now() >= app.deadline) {
      clearInterval(app.timerInterval);
      alert("Time is up! Your exam will be submitted automatically.");
      submitExam(true);
    }
  }, 1000);
}

function updateTimerDisplay() {
  const remaining = Math.max(0, app.deadline - Date.now());
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  const display = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  const el = document.getElementById("exam-timer");
  const box = el?.closest(".timer-box");
  el.textContent = display;

  if (box) {
    box.classList.remove("warning", "danger");
    if (remaining < 60000) box.classList.add("danger");
    else if (remaining < 300000) box.classList.add("warning");
  }
}

/* ── Submit ── */
document.getElementById("submit-exam-btn").addEventListener("click", () => {
  const answered = app.questions.filter((q) => app.answers[q.id]?.trim()).length;
  const total = app.questions.length;
  const unanswered = total - answered;

  const msg = unanswered > 0
    ? `You have ${unanswered} unanswered question(s). Are you sure you want to submit?`
    : "Are you sure you want to submit your exam?";

  if (confirm(msg)) submitExam(false);
});

async function submitExam(auto) {
  clearInterval(app.timerInterval);
  try {
    const res = await fetch(`/api/exams/${app.currentExam.id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: app.studentId }),
    });
    const data = await res.json();

    const answered = app.questions.filter((q) => app.answers[q.id]?.trim()).length;
    const total = app.questions.length;

    document.getElementById("result-summary").innerHTML =
      `Exam <strong>${app.currentExam.id}</strong> submitted successfully.<br>` +
      `Student: <strong>${app.studentId}</strong><br>` +
      `Answered: <strong>${answered} / ${total}</strong> questions.` +
      (auto ? "<br><em>Submitted automatically — time expired.</em>" : "");

    showPage("page-result");
  } catch (err) {
    alert("Submission failed: " + err.message);
  }
}

/* ── Back to Dashboard ── */
document.getElementById("back-dashboard-btn").addEventListener("click", () => {
  app.currentExam = null;
  app.currentAttempt = null;
  app.questions = [];
  app.answers = {};
  showPage("page-dashboard");
  loadDashboard();
});

/* ── Helpers ── */
function scrollToQuestion(qId) {
  document.getElementById(`qcard-${qId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
