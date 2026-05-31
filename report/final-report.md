## SVV Lab Semester Project Report — Online Examination System (Simplified)

### Group Information
- **Section**:
- **Group members (3 students)**:
  - Name / Reg No:
  - Name / Reg No:
  - Name / Reg No:
- **Project domain**: Online Examination System (simplified)

---

## 1. Introduction
This project applies a structured Software Verification & Validation (SVV) pipeline to a simplified Online Examination System. The main objective is to prioritize correctness by modeling system state and operations formally, verifying constraints, and validating requirements coverage.

## 2. Objectives
- Produce a verifiable **SRS** and record requirement defects.
- Formally model the system in **Z** with state, invariants, and operations.
- Specify operations in **VDM** using pre/post contracts.
- Verify relational constraints using **Alloy**, including counterexample analysis.
- Provide **validation evidence**, **CI evidence**, and a **security scan report** (OWASP ZAP).

## 3. Methodology (SVV Pipeline)
### 3.1 Requirement Engineering
- Deliverables:
  - `requirements/SRS.md`
  - `requirements/defect-taxonomy.md`
- Notes:
  - Requirements were refined to remove ambiguity and to make them verifiable.

### 3.2 Formal Modeling (Z Notation)
- Deliverable: `z-model/exam_system.z`
- State includes:
  - Exam lifecycle: Draft, Published
  - Attempt lifecycle per (Student, Exam): None, InProgress, Submitted
- Invariants include:
  - Answers only exist for started attempts (InProgress/Submitted)
  - Single-valued attempt status per (Student, Exam) via functional mapping

### 3.3 Functional Specification (VDM)
- Deliverable: `vdm-spec/ExamSystem.vdmsl`
- Operations specified with contracts:
  - PublishExam
  - StartExam
  - SaveAnswer
  - SubmitExam

### 3.4 Structural Verification (Alloy)
- Deliverables:
  - `alloy-model/exam_system_counterexample.als` (intentionally incomplete)
  - `alloy-model/exam_system_fixed.als` (fixed constraints)
  - `alloy-model/counterexample-report.md`
- Outcome:
  - A counterexample was generated for the single-attempt rule, analyzed, and fixed.

### 3.5 Validation & Security
- Validation checklist: `validation/validation-checklist.md`
- Security scan report placeholder: `validation/security-zap-report.md`
- Prototype target for ZAP: `prototype/` (Node/Express app)

## 4. Tools Used
- Git + GitHub
- Z tools (CZT / Community Z Tools)
- VDMTools / Overture (VDM-SL)
- Alloy Analyzer
- GitHub Actions
- OWASP ZAP

## 5. Results
### 5.1 Requirements results
- Ambiguity and inconsistency defects were identified and resolved.

### 5.2 Z / VDM results
- Operations were specified with explicit preconditions ensuring:
  - start only if published
  - save only while in progress
  - submit only before deadline
  - no edits after submission

### 5.3 Alloy results
- Counterexample demonstrated violation of single-attempt property in incomplete model.
- Fixed model enforces unique attempt per (student, exam) and passes checks within scope.

### 5.4 CI evidence
- GitHub Actions workflow checks repository structure and deliverable presence:
  - `.github/workflows/svv-ci.yml`

### 5.5 Security scan (OWASP ZAP)
- Target: `http://localhost:3000` (prototype)
- Attach exported ZAP report into `validation/` folder as required.

## 6. Conclusion
The system requirements were translated into formal constraints and verified using multiple complementary methods. Alloy counterexample analysis provided practical evidence of constraint necessity, while Z and VDM ensured operation-level correctness via invariants and contracts.

## 7. Appendix (Artifacts)
- SRS: `requirements/SRS.md`
- Defect taxonomy: `requirements/defect-taxonomy.md`
- Z Model: `z-model/exam_system.z`
- VDM Spec: `vdm-spec/ExamSystem.vdmsl`
- Alloy models + counterexample report: `alloy-model/`
- Validation & Security: `validation/`

