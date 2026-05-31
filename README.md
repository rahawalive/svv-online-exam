# SVV Lab Semester Project — Online Examination System (Simplified)

This repository contains the complete SVV verification pipeline deliverables for a **simplified Online Examination System**.

## Repository structure (as required)

- `requirements/`: SRS + defect taxonomy
- `z-model/`: Z notation model
- `vdm-spec/`: VDM specification (contracts)
- `alloy-model/`: Alloy model + counterexample analysis
- `validation/`: validation checklist + OWASP ZAP report placeholder
- `ci-pipeline/`: GitHub Actions workflow (CI evidence)
- `prototype/`: minimal runnable web app for OWASP ZAP scanning
- `report/`: final report (Markdown template you can export to PDF)

## Quick start (for OWASP ZAP target)

Prerequisite: Node.js (LTS).

```bash
cd prototype
npm install
npm run start
```

The prototype will start on `http://localhost:3000`.

## What to submit

- All folders above
- `report/final-report.md` exported to PDF (8–15 pages)
- Screenshots or exported report from Alloy run (captured in `alloy-model/counterexample-report.md`)
- OWASP ZAP report export (replace `validation/security-zap-report.md` with your exported file if required)

