---
id: "0003"
title: "Marketplace UI Setup Wizard Discord Slack"
stage: general
date: "2026-02-21"
surface: agent
model: claude-sonnet-4-6
feature: none
branch: main
user: abdullah
command: "do it — implement OpenClaw-inspired improvements"
labels: ["feature", "frontend", "next.js", "marketplace", "onboarding", "discord", "slack"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/src/app/skills/page.tsx
  - frontend/src/app/skills/SkillsClient.tsx
  - frontend/src/app/setup/page.tsx
  - frontend/src/components/Sidebar.tsx
  - src/integrations/discord_client.py
  - src/integrations/slack_client.py
  - config/integrations.env
  - requirements.txt
tests: []
---

## Prompt

Continue from where you left off. do it — implement the top 3 OpenClaw-inspired improvements: Skills Marketplace UI, Setup Wizard, Discord/Slack integrations.

Also: follow project structure — use config folder for env files.

## Response

### Skills Marketplace (`/skills`)
- Rewrote `skills/page.tsx` as thin server wrapper → `SkillsClient.tsx` client component
- Live search (name + description), category filter tabs with counts
- Cards: colored icon per category, animated active pulse, version + run count stats
- Summary header: Active / Total / Total Runs stats

### Setup Wizard (`/setup`)
- 8-step wizard: Welcome → Gmail → WhatsApp → LinkedIn → Telegram → Discord → Slack → Done
- Progress bar + clickable step dots, Back/Skip/Continue navigation
- Per-integration numbered setup instructions
- Discord & Slack marked "Coming Soon" with skip prompt
- Done screen with launch command
- "Setup" link + GearIcon added to Sidebar

### Discord & Slack Integration Stubs
- `src/integrations/discord_client.py` — DiscordClient class with start(), create_task_from_message()
- `src/integrations/slack_client.py` — SlackClient class with start(), send_message(), create_task_from_message()
- Both load from `config/integrations.env` (project convention)
- Both pass py_compile with no errors

### Config Folder Convention (user request)
- Discord/Slack vars removed from root `.env`
- Created `config/integrations.env` — single source of truth for ALL integration credentials (Gmail, WhatsApp, LinkedIn, Telegram, Twitter, Facebook, Discord, Slack, Firebase)
- discord.py and slack_bolt added as commented entries in requirements.txt (activate when ready)
