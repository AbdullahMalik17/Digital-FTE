---
title: "I built a self-evolving AI Employee that manages my Gmail, invoices, and social media"
published: false
description: "How I built Abdullah Junior, a high-autonomy AI agent system that acts as a comprehensive Digital Employee."
tags: "ai, python, agents, automation"
---

**Check out the open-source GitHub Repository:** [AbdullahMalik17/Digital-FTE](https://github.com/AbdullahMalik17/Digital-FTE) ⭐️ *(If you find this interesting, consider dropping a star!)*

---

I’ve always struggled with the administrative overhead of freelance work and managing multiple projects. The endless cycle of monitoring emails, drafting replies, generating invoices, and maintaining an active social media presence was eating into my deeply focused development time.

I needed help. But instead of hiring a virtual assistant, I decided to build a **Digital FTE (Full-Time Equivalent)**. 

Meet **Abdullah Junior**—my open-source, self-evolving AI employee. 

## What does it actually do?

The system operates 24/7 on a dual-agent architecture (Cloud + Local) to balance constant availability with extreme security. Here is what my digital employee handles for me right now:

### 1. Intelligent Email Management (The Gmail Watcher)
It continuously monitors my inbox. When a client emails asking for project updates or requesting a new feature, the agent pulls context from past interactions, drafts a thoughtful reply, and queues it in my Obsidian vault for approval. It ignores personal threads (tagged `NO_AI`) to maintain privacy.

### 2. Autonomous Invoicing & Accounting (Odoo Integration)
If a vendor emails me a bill, the agent extracts the data and logs the expense in Odoo. If a project milestone is reached, it uses the Model Context Protocol (MCP) to generate a professional PDF invoice and send it to the client.

### 3. Social Media Management
It manages my Twitter and Meta accounts. Instead of just scheduling static posts, it can draft entire 10-tweet threads, monitor mentions, and propose engagement replies based on my past tone. 

## How It Works Under the Hood

The entire system revolves around a local **Obsidian Vault** synced via Git, which acts as the agent's central nervous system. 

1. **Watchers** (running in the cloud) poll Gmail, WhatsApp, and LinkedIn APIs.
2. When activity happens, the **Cloud Agent** reasons using an LLM (Claude 3.5 or Gemini 1.5 Pro).
3. It drafts a proposal as a Markdown file in `Vault/Needs_Action/`.
4. My **Local Agent** detects this sync. I review it on my phone via Obsidian.
5. Once I move the file to `Pending_Approval/` and hit OK, the Local Agent executes the action using local MCP server connectors.

![E2E Architecture](https://raw.githubusercontent.com/AbdullahMalik17/Digital-FTE/main/Screenshot%202026-02-24%20200519.png)

## The "Self-Evolving" Part

The coolest feature? The system *learns*. 
If a Python script fails during execution, an autonomous Guardian system captures the traceback, asks the AI to write a patch to fix it, and dynamically updates its own `src/` directory. It also analyzes logs to figure out which models are most cost-effective for different tasks and rewrites its instructions to save on API costs.

## Try It Yourself

I built this for the 2026 AI Employee Hackathon, and I’ve open-sourced the entire orchestrator, agent framework, and MCP servers. 

You can set it up in under 5 minutes:

```bash
git clone https://github.com/AbdullahMalik17/Digital-FTE.git
cd Digital-FTE
pip install -r requirements.txt
python src/local_agent.py
```

I’d love to hear your thoughts or see what custom connectors you build for your own AI employee. Let's build a future where we do the creating, and the agents do the managing. 

*Drop a ⭐️ on [GitHub](https://github.com/AbdullahMalik17/Digital-FTE) if you'd like to support the project, or ask me any questions in the comments below!*
