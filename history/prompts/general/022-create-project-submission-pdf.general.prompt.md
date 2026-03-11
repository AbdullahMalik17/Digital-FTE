---
id: 022
title: Create project submission PDF
stage: general
date: 2026-03-09
surface: agent
model: gpt-5.1
feature: none
branch: main
user: local
command: cursor-gpt: generate-submission-pdf
labels: [docs,submission,pdf]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - scripts/generate_project_submission_pdf.py
 - docs/Project_Submission_Digital-FTE.pdf
 - history/prompts/general/022-create-project-submission-pdf.general.prompt.md
tests:
 - none
---

## Prompt

<user_query>
Create a pdf file to tell all the details to submit the Project 
</user_query>

## Response snapshot

- Generated a submission-ready PDF at `docs/Project_Submission_Digital-FTE.pdf` containing project overview, problem/solution, features, architecture, integrations, quick start, demo flow, and safety model.
- Added a reproducible generator script `scripts/generate_project_submission_pdf.py` (uses `reportlab`) so the PDF can be updated easily as the README evolves.

## Outcome

- ✅ Impact: Submission asset created for hackathon/project entries.
- 🧪 Tests: Not required (document generation only).
- 📁 Files: Added generator script + generated PDF + PHR record.
- 🔁 Next prompts: Customize PDF to match a specific submission form (fields, word limits, team info, screenshots).
- 🧠 Reflection: Having a generator script prevents stale submission docs and makes iteration fast.

## Evaluation notes (flywheel)

- Failure modes observed: None.
- Graders run and results (PASS/FAIL): Manual review PASS.
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Add a “Judging highlights” page with quantified impact and a QR link to demo video.
