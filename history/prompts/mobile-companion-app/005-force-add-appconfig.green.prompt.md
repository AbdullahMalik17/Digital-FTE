---
id: "005"
title: "Force Add AppConfig to Git"
stage: "green"
date_iso: "2026-01-27"
surface: "agent"
model: "gemini-2.0-flash-exp"
feature: "mobile-companion-app"
branch: "main"
user: "user"
command: "Resolve the Issue"
labels:
  - "mobile"
  - "fix"
  - "git"
  - "build"
links:
  - "null"
files_yaml:
  - "mobile/config/AppConfig.ts"
tests_yaml:
  - "null"
prompt_text: |
  Resolve the Issue
response_text: |
  The user requested to resolve the build issue. The previous failure was due to `mobile/config/AppConfig.ts` missing on EAS.
  Found that `mobile/config` was in `.gitignore`, preventing the file from being committed and thus uploaded to EAS (which uses git status).
  I forcefully added the file to git (`git add -f`) and committed it.
  Now the user can re-run the build command.
---
