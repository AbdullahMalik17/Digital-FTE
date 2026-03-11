---
id: 024
title: Add good first issue template
stage: general
date: 2026-03-09
surface: agent
model: gpt-5.1
feature: none
branch: main
user: local
command: cursor-gpt: add-gfi-template-and-docs-readme
labels: [docs,contributing,github]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .github/ISSUE_TEMPLATE/good_first_issue.yml
 - CONTRIBUTING.md
 - docs/README.md
 - README.md
 - history/prompts/general/024-issue-template-and-mintlify-readme.general.prompt.md
tests:
 - none
---

## Prompt

<user_query>
ok do it 
</user_query>

## Response snapshot

- Added a GitHub Issue template for beginner-friendly tasks: `.github/ISSUE_TEMPLATE/good_first_issue.yml` (auto-labels as `good first issue`).
- Updated `CONTRIBUTING.md` to reference the correct YAML templates and explain the good-first-issue workflow.
- Added `docs/README.md` with Mintlify preview/deploy instructions and linked the docs workflow from the main `README.md`.

## Outcome

- ✅ Impact: Maintainers can create well-scoped “good first issues” quickly; contributors get a clearer on-ramp; docs are more product-like and ready for interactive hosting.
- 🧪 Tests: Not required (templates/docs only).
- 📁 Files: Added issue template + docs README; updated project README and contributing guide.
- 🔁 Next prompts: Deploy docs (Mintlify/GitBook) and replace README placeholder with the live docs URL; create the initial GFI issues using the new template.
- 🧠 Reflection: Lowering contributor friction and improving docs navigation are compounding levers for open-source growth.

## Evaluation notes (flywheel)

- Failure modes observed: None.
- Graders run and results (PASS/FAIL): Manual review PASS.
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Add a GitHub label set (bug/enhancement/good first issue/docs) via repo settings or automation.

