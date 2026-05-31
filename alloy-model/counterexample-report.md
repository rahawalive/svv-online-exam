## Alloy Counterexample Analysis Report (Mandatory)

### Property
**Single attempt per (Student, Exam)**  
Formal statement:
- For each student `s` and exam `e`, there exists **at most one** `Attempt` with `(student=s, exam=e)`.

### Run 1 — Counterexample produced (expected)
- **Model file**: `alloy-model/exam_system_counterexample.als`
- **Check**: `SingleAttemptPerStudentExam`
- **Result**: **FAILED**

#### Counterexample summary
Alloy produced an instance in which:
- a `Student` **S0** and an `Exam` **E0** exist, and
- there are **two distinct** `Attempt` atoms, **A0** and **A1**, such that:
  - `A0.student = S0` and `A0.exam = E0`
  - `A1.student = S0` and `A1.exam = E0`

This violates the single-attempt requirement.

#### Root cause
The model did not include any fact restricting attempts to be unique per `(student, exam)`.

### Fix applied
- **Model file**: `alloy-model/exam_system_fixed.als`
- Added `fact UniqueAttemptPerStudentExam` enforcing uniqueness.

### Run 2 — After fix
- **Check**: `SingleAttemptPerStudentExam`
- **Result**: **PASSED** within the chosen scope (`for 4 but 6 Int`).

