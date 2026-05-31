# SVV Online Examination System — Complete Project Manual

> A full guide to every file, folder, concept, and workflow in this project.

---

## Table of Contents

1. [What This Project Is](#1-what-this-project-is)
2. [Project Folder Structure](#2-project-folder-structure)
3. [The SVV Pipeline — Big Picture](#3-the-svv-pipeline--big-picture)
4. [requirements/ — SRS & Defect Taxonomy](#4-requirements--srs--defect-taxonomy)
5. [z-model/ — Z Notation Formal Model](#5-z-model--z-notation-formal-model)
6. [vdm-spec/ — VDM Specification](#6-vdm-spec--vdm-specification)
7. [alloy-model/ — Alloy Structural Verification](#7-alloy-model--alloy-structural-verification)
8. [validation/ — Validation Checklist & Security Scan](#8-validation--validation-checklist--security-scan)
9. [prototype/ — Runnable Web Application](#9-prototype--runnable-web-application)
10. [ci-pipeline/ & .github/ — CI/CD Pipeline](#10-ci-pipeline---github--cicd-pipeline)
11. [report/ — Final Report](#11-report--final-report)
12. [How Everything Connects](#12-how-everything-connects)
13. [How to Run the Project](#13-how-to-run-the-project)
14. [GitHub Repository](#14-github-repository)

---

## 1. What This Project Is

This is an **SVV (Software Verification & Validation) Lab Semester Project**. The goal is NOT to build a production exam system — it is to apply a formal verification pipeline to a simplified system and prove that its rules are correct.

The system being modeled is an **Online Examination System** with these core rules:
- An exam starts as a Draft, then gets Published.
- A student can only start an exam that is Published.
- Each student gets exactly one attempt per exam.
- Answers can only be saved while the attempt is InProgress.
- Submission is only allowed before the deadline.
- Once submitted, answers cannot be changed.

These rules are expressed and verified using three formal methods: **Z Notation**, **VDM**, and **Alloy**.

---

## 2. Project Folder Structure

```
svv-online-exam/
│
├── requirements/           ← Step 1: What the system must do
│   ├── SRS.md              ← Software Requirements Specification
│   └── defect-taxonomy.md  ← Defects found in requirements + fixes
│
├── z-model/                ← Step 2: Formal state model
│   └── exam_system.z       ← Z Notation model (state + operations)
│
├── vdm-spec/               ← Step 3: Functional contracts
│   └── ExamSystem.vdmsl    ← VDM-SL specification (pre/post conditions)
│
├── alloy-model/            ← Step 4: Structural constraint verification
│   ├── exam_system_counterexample.als  ← Broken model (produces counterexample)
│   ├── exam_system_fixed.als           ← Fixed model (passes checks)
│   └── counterexample-report.md        ← Analysis of what went wrong and fix
│
├── validation/             ← Step 5: Evidence that requirements are met
│   ├── validation-checklist.md  ← Maps each FR to its verification evidence
│   └── security-zap-report.md   ← OWASP ZAP security scan placeholder
│
├── prototype/              ← Step 6: Real runnable app (ZAP scan target)
│   ├── server.js           ← Express.js backend API
│   ├── package.json        ← Node.js dependencies
│   └── public/
│       ├── index.html      ← Full UI (login, dashboard, exam, result)
│       ├── style.css       ← All styling
│       └── app.js          ← Frontend JavaScript logic
│
├── ci-pipeline/
│   └── github-actions.yml  ← CI workflow (reference copy)
│
├── .github/
│   └── workflows/
│       └── svv-ci.yml      ← Active GitHub Actions CI workflow
│
├── report/
│   └── final-report.md     ← Final project report template
│
├── README.md               ← Quick start guide
├── PROJECT-MANUAL.md       ← This file
└── .gitignore              ← Excludes node_modules etc. from git
```

---

## 3. The SVV Pipeline — Big Picture

The project follows a structured pipeline. Each step builds on the previous one.

```
Requirements (SRS)
       ↓
  Defect Review  ← Find ambiguities, fix them
       ↓
  Z Notation     ← Model the state and operations mathematically
       ↓
  VDM-SL         ← Add pre/post contracts to each operation
       ↓
  Alloy          ← Check structural constraints, find counterexamples
       ↓
  Validation     ← Map every requirement to its proof/evidence
       ↓
  Prototype      ← Build a real app that implements the same rules
       ↓
  Security Scan  ← Run OWASP ZAP against the prototype
       ↓
  CI Pipeline    ← Automate checks on every git push
```

Think of it this way:
- **Z and VDM** prove the logic is correct on paper.
- **Alloy** finds bugs in the model before they reach code.
- **The prototype** shows the rules work in a real application.
- **ZAP** checks the prototype for web security issues.
- **CI** makes sure nothing is accidentally deleted or broken.

---

## 4. requirements/ — SRS & Defect Taxonomy

### 4.1 `requirements/SRS.md` — Software Requirements Specification

This is the starting point of the entire project. It defines what the system must do.

**Key sections:**

**Actors** — Who uses the system:
- `Student` — starts exams, saves answers, submits
- `Admin/Examiner` — creates and publishes exams

**System States** — The two lifecycles:

| Entity | States |
|--------|--------|
| Exam | Draft → Published |
| Attempt (per Student+Exam) | None → InProgress → Submitted |

**Functional Requirements (FR):**

| ID | Rule |
|----|------|
| FR-1 | Admin can create an exam in Draft state |
| FR-2 | Admin can publish an exam only if it is in Draft |
| FR-3 | Student can start an exam only if it is Published |
| FR-4 | Each student has at most ONE attempt per exam |
| FR-5 | Answers can only be saved when attempt is InProgress |
| FR-6 | Submission only allowed if attempt is InProgress AND now ≤ deadline |
| FR-7 | After submission, answers cannot be changed |

**Verifiable Invariants** — Rules that must always hold:
- `INV-1`: At most one attempt per (Student, Exam)
- `INV-2`: Answers only exist for InProgress or Submitted attempts
- `INV-3`: No answer changes after submission

---

### 4.2 `requirements/defect-taxonomy.md` — Defect Taxonomy

Before writing formal models, the requirements were reviewed for defects. Three defects were found:

| Defect | Original Statement | Problem | Fix |
|--------|--------------------|---------|-----|
| D-1 | "Student can submit before time ends" | "time ends" is vague — does it mean a timer or a deadline? | Changed to: `now <= deadline(exam)` |
| D-2 | "Only one attempt allowed" | Doesn't say per what — per exam? per course? | Changed to: at most one attempt per (Student, Exam) pair |
| D-3 | SaveAnswer not restricted | If allowed any time, a submitted student could still edit answers | Added: SaveAnswer only allowed when attempt is InProgress |

**Why this matters:** Formal tools like Z and Alloy need precise, unambiguous rules. Vague English requirements cannot be modeled or verified.

---

## 5. z-model/ — Z Notation Formal Model

### File: `z-model/exam_system.z`

Z Notation is a mathematical language for describing system state and operations. Think of it as a very precise blueprint.

### The State Schema — `ExamSystem`

This defines all the data the system holds at any point in time:

```
examStatus : EXAM → STATUS          -- each exam has a status (Draft/Published)
deadline   : EXAM → TIME            -- each exam has a deadline
now        : TIME                   -- the current time
questions  : EXAM → set of QUESTION -- each exam has a set of questions

astatus    : (STUDENT × EXAM) → ASTATUS   -- attempt status per student+exam pair
answers    : (STUDENT × EXAM × QUESTION) → ANSWER  -- saved answers (partial map)
```

**The Invariant** (always true):
```
For every student s, exam e, question q:
  if (s, e, q) is in the answers map
  then the attempt status for (s, e) must be InProgress OR Submitted
```
This enforces INV-2: you can't have an answer without a started attempt.

### Operations

Each operation has **preconditions** (what must be true before) and **postconditions** (what changes after).

| Operation | Precondition | What changes |
|-----------|-------------|--------------|
| `PublishExam(e)` | exam must be in Draft | exam status → Published |
| `StartExam(s, e)` | exam is Published AND attempt is None | attempt status → InProgress |
| `SaveAnswer(s, e, q, a)` | attempt is InProgress AND question belongs to exam | answer is saved/updated |
| `SubmitExam(s, e)` | attempt is InProgress AND now ≤ deadline | attempt status → Submitted |

**Key insight:** The preconditions in Z are the formal proof that FR-3 through FR-7 are enforced. If a precondition is not met, the operation simply cannot happen.

---

## 6. vdm-spec/ — VDM Specification

### File: `vdm-spec/ExamSystem.vdmsl`

VDM-SL (Vienna Development Method — Specification Language) is similar to Z but uses a more programming-like syntax. It adds explicit `pre` and `post` conditions to each operation.

### Types Defined

```
Student, Exam, Question, Answer = token  -- abstract identifiers
Time = nat                               -- natural number (0, 1, 2, ...)
Status = <Draft> | <Published>
AStatus = <None> | <InProgress> | <Submitted>
```

### State

Same structure as Z — maps for exam status, deadlines, attempt status, and answers.

**State Invariant:**
```
-- INV-1: map type guarantees uniqueness of attempt per (student, exam)
-- INV-2: answers only exist for started attempts
forall st, e, q: mk_(st,e,q) in dom answers =>
  astatus(mk_(st,e)) = <InProgress> OR <Submitted>
```

### Operations with Contracts

**`PublishExam(e)`**
```
pre:  e is in examStatus AND examStatus(e) = <Draft>
post: examStatus(e) = <Published>, everything else unchanged
```

**`StartExam(st, e)`**
```
pre:  exam is Published AND attempt status is <None>
post: astatus(st,e) = <InProgress>, answers and examStatus unchanged
```

**`SaveAnswer(st, e, q, a)`**
```
pre:  attempt is <InProgress> AND question belongs to exam
post: answer is saved, attempt status and exam status unchanged
```

**`SubmitExam(st, e)`**
```
pre:  attempt is <InProgress> AND now <= deadline(e)
post: astatus(st,e) = <Submitted>, answers unchanged
```

**Why VDM in addition to Z?** VDM's `pre`/`post` style is closer to how programmers think about function contracts. It also supports tool-based execution and testing (VDMTools, Overture IDE).

---

## 7. alloy-model/ — Alloy Structural Verification

Alloy is a tool that automatically searches for counterexamples — instances where your rules are violated. You write a model, declare what should always be true (an assertion), and Alloy tries to break it.

---

### File: `alloy-model/exam_system_counterexample.als` — The Broken Model

This model is **intentionally incomplete**. It is missing the constraint that enforces one attempt per student per exam.

**What it has:**
```alloy
sig Attempt {
  student: one Student,
  exam: one Exam,
  astatus: one AStatus,
  answers: Question -> lone Answer
}

fact AnswerOnlyIfStarted { ... }  -- INV-2 is present

assert SingleAttemptPerStudentExam {
  all s: Student, e: Exam |
    lone a: Attempt | a.student = s and a.exam = e
}

check SingleAttemptPerStudentExam for 4 but 6 Int
```

**What is missing:** There is no `fact` enforcing uniqueness. The `assert` checks for it, but without a `fact` to enforce it, Alloy finds a world where it is violated.

**Result:** Alloy produces a **counterexample** — two Attempt atoms (A0 and A1) both belonging to the same Student S0 and Exam E0. This proves the rule is NOT guaranteed by the model.

---

### File: `alloy-model/exam_system_fixed.als` — The Fixed Model

The fix is adding one `fact`:

```alloy
fact UniqueAttemptPerStudentExam {
  all s: Student, e: Exam |
    lone a: Attempt | a.student = s and a.exam = e
}
```

Now the model **enforces** the rule, not just checks for it. Running the same assertion now **passes** — Alloy cannot find any counterexample within the checked scope.

---

### File: `alloy-model/counterexample-report.md` — Analysis Report

Documents the full story:
1. **Run 1** — Counterexample found (two attempts for same student+exam)
2. **Root cause** — Missing uniqueness fact
3. **Fix** — Added `fact UniqueAttemptPerStudentExam`
4. **Run 2** — Assertion passes after fix

**Why this is important for the lab:** The assignment requires you to deliberately produce a counterexample, analyze it, fix it, and document it. This file is that documentation.

---

## 8. validation/ — Validation Checklist & Security Scan

### File: `validation/validation-checklist.md`

This file closes the loop between requirements and verification. For every functional requirement, it shows exactly where and how it was verified.

| Requirement | Verified By | Evidence Location |
|-------------|-------------|-------------------|
| FR-2 Publish only from Draft | Z precondition + VDM pre | `PublishExam` in Z and VDM files |
| FR-3 Start only if Published | Z/VDM precondition | `StartExam` in Z and VDM files |
| FR-4 Single attempt | Alloy counterexample + fix | `counterexample-report.md` |
| FR-5 Save only while InProgress | Z/VDM precondition | `SaveAnswer` in Z and VDM files |
| FR-6 Submit before deadline | Z/VDM precondition `now <= deadline` | `SubmitExam` in Z and VDM files |
| FR-7 No edits after submit | SaveAnswer precondition blocks it | `SaveAnswer` preconditions |

All results: **Pass**.

---

### File: `validation/security-zap-report.md` — OWASP ZAP Report

This is a **placeholder** for the OWASP ZAP security scan report. OWASP ZAP is a free security tool that scans web applications for vulnerabilities like:
- SQL Injection
- Cross-Site Scripting (XSS)
- Missing security headers
- Insecure cookies

**To complete this step:**
1. Start the prototype: `cd prototype && npm run start`
2. Open OWASP ZAP
3. Run an automated scan against `http://localhost:3000`
4. Export the report and replace/update this file

---

## 9. prototype/ — Runnable Web Application

The prototype is a real Node.js web application that **implements the same rules** defined in the formal models. It serves as the target for OWASP ZAP security scanning.

---

### `prototype/package.json`

Defines the project metadata and dependencies:

```json
{
  "name": "svv-online-exam-prototype",
  "scripts": { "start": "node server.js" },
  "dependencies": {
    "express": "^4.19.2",   -- web framework
    "helmet": "^7.1.0"      -- security headers middleware
  }
}
```

Run `npm install` once to download dependencies into `node_modules/`.

---

### `prototype/server.js` — The Backend API

Built with **Express.js**. Stores all data in memory (no database — this is a demo).

**Security middleware:**
```js
app.use(helmet({ contentSecurityPolicy: false }));
```
Helmet automatically sets HTTP security headers (X-Frame-Options, X-Content-Type-Options, etc.).

**In-memory data:**
```js
const state = {
  exams: [{ id: "EXAM-1", status: "Published", deadline: ..., questions: [...] }],
  attempts: []
}
```

**API Endpoints:**

| Method | URL | What it does |
|--------|-----|--------------|
| `GET` | `/` | Serves the HTML frontend |
| `GET` | `/health` | Returns `{ ok: true }` — used by monitoring |
| `GET` | `/api/exams` | Lists all exams with status, deadline, question count |
| `GET` | `/api/exams/:examId/questions` | Returns questions for a specific exam |
| `POST` | `/api/exams/:examId/start` | Starts an attempt (body: `{ studentId }`) |
| `POST` | `/api/exams/:examId/answer` | Saves an answer (body: `{ studentId, questionId, value }`) |
| `POST` | `/api/exams/:examId/submit` | Submits the attempt (body: `{ studentId }`) |

**How the formal rules map to the API:**

| Formal Rule | Enforced in server.js |
|-------------|----------------------|
| FR-3: Start only if Published | `if (exam.status !== "Published") return 409` |
| FR-4: Single attempt | `if (existing) return 409 "attempt already exists"` |
| FR-5: Save only if InProgress | `if (attempt.status !== "InProgress") return 409` |
| FR-6: Submit before deadline | `if (Date.now() > exam.deadline) return 409` |

---

### `prototype/public/index.html` — The Frontend UI

A single-page application with four screens managed by JavaScript:

| Screen | ID | Purpose |
|--------|----|---------|
| Login | `page-login` | Enter Student ID and password to sign in |
| Dashboard | `page-dashboard` | View available exams, click to start |
| Exam | `page-exam` | Answer questions, see timer, navigate questions |
| Result | `page-result` | Confirmation after submission |

Only one screen is visible at a time. JavaScript switches between them by toggling the `active` CSS class.

---

### `prototype/public/style.css` — Styling

Uses CSS custom properties (variables) for consistent theming:
```css
--primary: #4f46e5;    /* indigo — buttons, highlights */
--danger:  #dc2626;    /* red — submit button, timer warning */
--bg:      #f1f5f9;    /* light grey — page background */
--surface: #ffffff;    /* white — cards */
```

Key UI components:
- `.login-card` — centered login form with gradient background
- `.exam-card` — dashboard card per exam with badge (Published/Closed)
- `.question-card` — individual question with textarea, turns blue border when answered
- `.timer-box` — countdown timer, turns yellow under 5 min, red under 1 min
- `.q-nav-btn` — question navigator buttons, turn indigo when answered

---

### `prototype/public/app.js` — Frontend Logic

Manages the entire UI flow:

**`app` object** — holds all runtime state:
```js
const app = {
  studentId: null,       // logged-in student
  currentExam: null,     // exam being taken
  questions: [],         // list of questions
  answers: {},           // { questionId: answerText }
  timerInterval: null,   // setInterval reference
  deadline: null,        // Unix timestamp
}
```

**Key functions:**

| Function | What it does |
|----------|-------------|
| `showPage(id)` | Hides all pages, shows the one with the given ID |
| `loadDashboard()` | Fetches `/api/exams` and renders exam cards |
| `startExam(examId)` | Calls `/start`, fetches questions, renders exam page |
| `saveAnswer(qId, value)` | Updates local state + calls `/answer` API |
| `updateProgress()` | Recalculates answered count, updates progress bar |
| `startTimer()` | Sets up `setInterval` to count down to deadline |
| `submitExam()` | Calls `/submit`, shows result page |

**Auto-save:** Every keystroke in an answer box calls `saveAnswer()`, which immediately sends the answer to the server. If the browser crashes, answers are preserved.

**Timer auto-submit:** When the countdown reaches zero, `submitExam(true)` is called automatically.

---

## 10. ci-pipeline/ & .github/ — CI/CD Pipeline

### What is CI?

CI (Continuous Integration) means every time you push code to GitHub, automated checks run to make sure nothing is broken or missing.

---

### `.github/workflows/svv-ci.yml` — The Active Workflow

This is the file GitHub Actions actually reads. It runs on every `push` and `pull_request`.

**What it checks:**

Step 1 — Required directories exist:
```yaml
test -d requirements
test -d z-model
test -d vdm-spec
test -d alloy-model
test -d validation
test -d ci-pipeline
test -d prototype
test -d report
```

Step 2 — Required files exist:
```yaml
test -f requirements/SRS.md
test -f requirements/defect-taxonomy.md
test -f z-model/exam_system.z
test -f vdm-spec/ExamSystem.vdmsl
test -f alloy-model/exam_system_counterexample.als
test -f alloy-model/exam_system_fixed.als
test -f alloy-model/counterexample-report.md
test -f validation/validation-checklist.md
test -f validation/security-zap-report.md
test -f report/final-report.md
```

If any file is missing, the CI job **fails** and GitHub shows a red ✗ on the commit. This ensures all deliverables are always present.

---

### `ci-pipeline/github-actions.yml`

This is a reference copy of the workflow (slightly shorter version). The actual active one is in `.github/workflows/`. Both serve as documentation of the CI setup.

---

## 11. report/ — Final Report

### File: `report/final-report.md`

This is the template for the final submission report. It summarizes the entire SVV pipeline in one document.

**Sections:**
1. **Introduction** — what the project does and why
2. **Objectives** — SRS, Z, VDM, Alloy, validation, CI, security
3. **Methodology** — how each step was done (with file references)
4. **Tools Used** — Git, Z tools, VDMTools, Alloy Analyzer, GitHub Actions, OWASP ZAP
5. **Results** — what each step produced
6. **Conclusion** — summary of correctness evidence
7. **Appendix** — links to all artifact files

**What you need to fill in:**
- Group member names and registration numbers
- Section number
- Export to PDF for final submission (8–15 pages)

---

## 12. How Everything Connects

Here is the full traceability chain — how a single requirement flows through the entire project:

**Example: FR-4 (Single Attempt Rule)**

```
SRS.md
  └─ FR-4: "Each student has at most one attempt per exam"
       │
       ├─ defect-taxonomy.md
       │    └─ D-2: Original was vague ("only one attempt") → fixed to per (Student, Exam)
       │
       ├─ exam_system.z
       │    └─ astatus: (STUDENT × EXAM) → ASTATUS  [map = at most one value per key]
       │       StartExam precondition: astatus(s,e) = None
       │
       ├─ ExamSystem.vdmsl
       │    └─ StartExam pre: astatus(mk_(st,e)) = <None>
       │
       ├─ exam_system_counterexample.als
       │    └─ Missing fact → Alloy finds two attempts for same student+exam
       │
       ├─ exam_system_fixed.als
       │    └─ fact UniqueAttemptPerStudentExam → assertion passes
       │
       ├─ counterexample-report.md
       │    └─ Documents the counterexample and fix
       │
       ├─ server.js
       │    └─ if (existing) return 409 "attempt already exists"
       │
       └─ validation-checklist.md
            └─ FR-4 row: verified by Alloy counterexample + fix ✓
```

Every requirement has this same chain. That is the point of the SVV pipeline.

---

## 13. How to Run the Project

### Prerequisites
- [Node.js LTS](https://nodejs.org) — to run the prototype
- [Git](https://git-scm.com) — already installed
- [Alloy Analyzer](https://alloytools.org) — to run `.als` files (optional, for verification)
- [OWASP ZAP](https://www.zaproxy.org) — for security scanning (optional)

---

### Step 1 — Install dependencies (one time only)

Open a terminal in the project folder:
```bash
cd prototype
npm install
```

---

### Step 2 — Start the prototype server

```bash
cd prototype
npm run start
```

You will see:
```
Prototype running on http://localhost:3000
```

---

### Step 3 — Use the application

Open your browser and go to `http://localhost:3000`.

**Login screen:**
- Enter any Student ID (e.g. `STU-001`)
- Enter any password (demo mode — no real auth)
- Click Sign In

**Dashboard:**
- You will see `EXAM-1` listed as Published
- Click "Start Exam →"

**Exam screen:**
- Answer the questions in the text boxes
- Watch the countdown timer (top right)
- Answered questions turn blue in the navigator sidebar
- Click "Submit Exam" when done (or it auto-submits when time runs out)

**Result screen:**
- Shows your Student ID, exam ID, and how many questions you answered
- Click "Back to Dashboard" to return

---

### Step 4 — Run Alloy models (optional)

1. Download and open [Alloy Analyzer](https://alloytools.org/download.html)
2. Open `alloy-model/exam_system_counterexample.als`
3. Click **Execute** → `check SingleAttemptPerStudentExam`
4. Alloy will show a counterexample (two attempts for same student)
5. Open `alloy-model/exam_system_fixed.als` and run the same check
6. This time it passes — no counterexample found

---

### Step 5 — Run OWASP ZAP security scan (optional)

1. Make sure the prototype is running on `http://localhost:3000`
2. Open OWASP ZAP
3. Go to **Automated Scan**
4. Enter `http://localhost:3000` as the target URL
5. Click **Attack**
6. When done, export the report and save it to `validation/security-zap-report.md`

---

### Step 6 — Push changes to GitHub

```bash
git add .
git commit -m "your message here"
git push
```

GitHub Actions will automatically run the CI checks and show green ✓ or red ✗ on your commit.

---

## 14. GitHub Repository

**URL:** https://github.com/rahawalive/svv-online-exam

**Branch:** `master`

**CI Status:** Check the Actions tab on GitHub to see if all checks pass.

**To clone on another machine:**
```bash
git clone https://github.com/rahawalive/svv-online-exam.git
cd svv-online-exam/prototype
npm install
npm run start
```

---

## Quick Reference — File Purpose Summary

| File | One-line purpose |
|------|-----------------|
| `requirements/SRS.md` | Defines what the system must do (7 functional requirements) |
| `requirements/defect-taxonomy.md` | Documents 3 requirement defects found and fixed |
| `z-model/exam_system.z` | Mathematical state model with invariants and operation schemas |
| `vdm-spec/ExamSystem.vdmsl` | Functional contracts with pre/post conditions for each operation |
| `alloy-model/exam_system_counterexample.als` | Incomplete model that produces a counterexample |
| `alloy-model/exam_system_fixed.als` | Fixed model that passes all assertions |
| `alloy-model/counterexample-report.md` | Analysis of the counterexample and the fix applied |
| `validation/validation-checklist.md` | Maps every FR to its verification evidence |
| `validation/security-zap-report.md` | Placeholder for OWASP ZAP scan results |
| `prototype/server.js` | Express.js API implementing the exam rules |
| `prototype/public/index.html` | Full UI — login, dashboard, exam, result screens |
| `prototype/public/style.css` | All visual styling |
| `prototype/public/app.js` | Frontend logic — API calls, timer, navigation |
| `.github/workflows/svv-ci.yml` | GitHub Actions CI — checks all deliverables exist |
| `ci-pipeline/github-actions.yml` | Reference copy of the CI workflow |
| `report/final-report.md` | Final report template (fill in group info, export to PDF) |
| `README.md` | Quick start guide |
| `.gitignore` | Excludes node_modules and secrets from git |

---

*Manual written for SVV Lab Semester Project — Online Examination System (Simplified)*
