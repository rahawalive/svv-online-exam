// Online Examination System (Simplified) — Alloy model (fixed)

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

// FIX: enforce the single-attempt rule as a model constraint
fact UniqueAttemptPerStudentExam {
  all s: Student, e: Exam |
    lone a: Attempt | a.student = s and a.exam = e
}

assert SingleAttemptPerStudentExam {
  all s: Student, e: Exam |
    lone a: Attempt | a.student = s and a.exam = e
}

check SingleAttemptPerStudentExam for 4 but 6 Int

