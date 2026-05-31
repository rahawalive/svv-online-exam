## Requirement Defect Taxonomy (SVV)

This table documents defects found during requirement engineering and how they were corrected to become verifiable and consistent.

| Item | Requirement / Statement (as found) | Defect Type | Defect Description | Why it’s a defect | Corrected / Final Requirement |
|---|---|---|---|---|---|
| D-1 | “Student can submit before time ends.” | Ambiguity | “time ends” unclear (deadline vs duration) | Cannot be formally verified without a precise time rule | Submission is allowed only if `now <= deadline(exam)` (deadline-based). |
| D-2 | “Only one attempt allowed.” | Non-verifiable | Attempt identity not defined (per exam? per course? per day?) | Alloy/Z/VDM need explicit uniqueness scope | For each pair (Student, Exam), there is at most one attempt. |
| D-3 | (Draft) SaveAnswer not restricted | Inconsistency | If SaveAnswer allowed any time, it violates immutability | Conflicts with “answers locked after submit” | SaveAnswer is allowed only when attempt state is InProgress. |

