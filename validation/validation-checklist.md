## Validation Checklist (Derived from Requirements)

| Requirement | What to validate | How it is validated | Evidence (file/section) | Result |
|---|---|---|---|---|
| FR-2 Publish Exam | Publish only from Draft | Z precondition + VDM precondition | `z-model/exam_system.z` `PublishExam`; `vdm-spec/ExamSystem.vdmsl` `PublishExam` | Pass (by construction) |
| FR-3 Start Exam | Start only if Published | Z precondition + VDM precondition | `StartExam` in Z/VDM | Pass |
| FR-4 Single Attempt | At most one attempt per student per exam | Alloy counterexample then constraint fix | `alloy-model/counterexample-report.md` | Pass after fix |
| FR-5 Save Answer | Only while InProgress | Z/VDM preconditions prevent SaveAnswer otherwise | `SaveAnswer` in Z/VDM | Pass |
| FR-6 Submit Exam | Only before deadline | Z/VDM precondition `now <= deadline` | `SubmitExam` in Z/VDM | Pass |
| FR-7 No edits after submit | Answers immutable after submission | SaveAnswer disallowed when Submitted | `SaveAnswer` preconditions | Pass |

