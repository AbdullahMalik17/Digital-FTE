---
id: 025
title: Fix Mintlify npm cache error
stage: general
date: 2026-03-11
surface: agent
model: gpt-5.1
feature: none
branch: main
user: local
command: cursor-gpt: fix-npx-ecompromised-and-run-mintlify
labels: [docs,mintlify,npm,security]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - docs/docs.json
 - docs/SPECS_INDEX.md
 - docs/QUICK_START.md
 - .npmrc
 - .npmrc.example
 - history/prompts/general/025-fix-mintlify-npm-cache-and-docsjson.general.prompt.md
tests:
 - mintlify dev --no-open (manual)
---

## Prompt

<user_query>
@c:\Users\HP\.cursor\projects\e-WEB-DEVELOPMENT-Hacathan-2\terminals\3.txt:10-20 
</user_query>

## Response snapshot

- Diagnosed `npm error code ECOMPROMISED` / `Lock compromised` as a corrupted npm cache and lock mechanism failure during `npx mintlify`.
- Reset npm cache folders (`_cacache`, `_npx`) and verified cache integrity.
- Installed Mintlify CLI globally (skipping Puppeteer download) to avoid `npx` lock issues.
- Fixed Mintlify build errors:
  - Updated `docs/docs.json` navigation format to match schema (`navigation.pages`).
  - Escaped `<` comparisons in Markdown (`docs/SPECS_INDEX.md`, `docs/QUICK_START.md`) to avoid MDX parsing errors.
- Confirmed local preview starts successfully from `docs/` via `mintlify dev --no-open`.
- Removed a committed-risk secret from local `.npmrc` by replacing the token with `${NPM_TOKEN}` and added `.npmrc.example`.

## Outcome

- ✅ Impact: Mintlify interactive docs can preview locally; npm cache corruption resolved; reduced secret leakage risk.
- 🧪 Tests: Local Mintlify preview started and printed localhost URL.
- 📁 Files: Updated docs config and markdown; added `.npmrc.example`; sanitized local `.npmrc`.
- 🔁 Next prompts: Deploy docs (Mintlify/GitBook) and set README docs URL.
- 🧠 Reflection: Cache corruption and MDX parsing gotchas are common on Windows; schema-driven config prevents drift.

## Evaluation notes (flywheel)

- Failure modes observed: npm cache corruption; MDX parsing of `<number` tokens.
- Graders run and results (PASS/FAIL): Manual preview PASS.
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Add a CI check for docs build and secret scanning for `.npmrc`-like tokens.

