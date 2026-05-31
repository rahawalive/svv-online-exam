// Online Examination System (Simplified) — Alloy model
// This file is intentionally missing the uniqueness constraint for attempts,
// so it should produce a counterexample for the single-attempt rule.

enum Status { Draft, Published }
enum AStatus { None, InProgress, Submitted }

sig Student {}
sig Question {}
sig Answer {}

sig Exam {
  status: one Status,
  deadline: one Int,
  questions: set Question
}

sig Attempt {
  student: one Student,
  exam: one Exam,
  astatus: one AStatus,
  answers: Question -> lone Answer
}

fact AnswerOnlyIfStarted {
  all a: Attempt, q: Question |
    q in a.answers.Answer implies (a.astatus = InProgress or a.astatus = Submitted)
}

assert SingleAttemptPerStudentExam {
  all s: Student, e: Exam |
    lone a: Attempt | a.student = s and a.exam = e
}

check SingleAttemptPerStudentExam for 4 but 6 Int

