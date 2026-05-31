## Online Examination System (Simplified) — Software Requirements Specification (SRS)

### 1) Introduction
#### 1.1 Purpose
This SRS defines a simplified Online Examination System to be **formally modeled and verified** using Z Notation, VDM, and Alloy as required in SVV Lab.

#### 1.2 Scope
**In scope**
- Exam lifecycle: Draft → Published
- Student attempt lifecycle: None → InProgress → Submitted
- Answer saving while in progress
- Submission rules: single submission, deadline constraint
- Post-submission immutability of answers

**Out of scope**
- Authentication/authorization implementation details
- UI design, networking failures, concurrency, proctoring, plagiarism
- Automated grading (optional extension)

#### 1.3 Definitions
- **Attempt**: a student’s interaction instance with a specific exam.
- **Deadline-based timing**: submission permitted only if `now <= deadline(exam)`.

### 2) Overall Description
#### 2.1 Actors
- **Student**: starts exam, saves answers, submits.
- **Admin/Examiner**: creates exam, publishes exam.

#### 2.2 System states (minimum 3)
**Exam states**
- Draft
- Published

**Attempt states** (per Student × Exam)
- None
- InProgress
- Submitted

### 3) Functional Requirements

**FR-1 Create Exam**
- The Admin shall be able to create an exam in **Draft** state.

**FR-2 Publish Exam**
- The Admin shall be able to publish an exam only if it is in **Draft**.
- Publishing moves the exam state to **Published**.

**FR-3 Start Exam**
- A Student shall be able to start an exam only if the exam is **Published**.
- Starting creates an attempt in **InProgress** state if no attempt exists yet.

**FR-4 Single Attempt Rule**
- For each exam, a student shall have **at most one attempt**.
- If an attempt is **Submitted**, the student shall not start the exam again.

**FR-5 Save Answer**
- A Student shall be able to save or update an answer only if the attempt is **InProgress**.
- Saving an answer shall not change the exam state or attempt identity.

**FR-6 Submit Exam**
- A Student shall be able to submit only if:
  - the attempt is **InProgress**, and
  - current time `now` is **not after** the exam deadline (`now <= deadline`).
- Submission changes the attempt state to **Submitted**.

**FR-7 Immutability After Submission**
- After an attempt becomes **Submitted**, its answers shall not change.

### 4) Non-Functional Requirements
**NFR-1 Integrity**
- The system shall preserve stated invariants (single attempt, no post-submit edits).

**NFR-2 Auditability**
- The system shall keep consistent mappings for attempts and answers.

### 5) Verifiable Invariants (used across Z/VDM/Alloy)
**INV-1 Unique Attempt**
- For every (Student, Exam), there exists at most one attempt record/state.

**INV-2 Answer Ownership**
- Answers exist only for attempts that are InProgress or Submitted.

**INV-3 No Post-Submit Edits**
- Answers cannot be saved/modified after submission (enforced by operation preconditions).

### 6) Acceptance / Validation Criteria
- Each FR maps to at least one:
  - Z schema invariant or operation precondition
  - VDM pre/post condition
  - Alloy fact/assertion
- Alloy produces at least one counterexample during development, documented and fixed.

