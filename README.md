# 🤖 Digital-FTE — Abdullah Junior

> **"Your life and business on autopilot. A self-evolving, cloud-native AI Employee that never sleeps."**

[![Python CI](https://github.com/AbdullahMalik17/Digital-FTE/actions/workflows/python-ci.yml/badge.svg)](https://github.com/AbdullahMalik17/Digital-FTE/actions/workflows/python-ci.yml)
[![Python](https://img.shields.io/badge/Python-79.6%25-blue?style=flat-square&logo=python)](https://github.com/AbdullahMalik17/Digital-FTE)
[![TypeScript](https://img.shields.io/badge/TypeScript-13%25-3178C6?style=flat-square&logo=typescript)](https://github.com/AbdullahMalik17/Digital-FTE)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](https://opensource.org/licenses/MIT)
[![Stars](https://img.shields.io/github/stars/AbdullahMalik17/Digital-FTE?style=flat-square)](https://github.com/AbdullahMalik17/Digital-FTE/stargazers)
[![Commits](https://img.shields.io/github/commit-activity/m/AbdullahMalik17/Digital-FTE?style=flat-square)](https://github.com/AbdullahMalik17/Digital-FTE/commits/main)
[![Built for Hackathon](https://img.shields.io/badge/Built%20for-AI%20Employee%20Hackathon%202026-purple?style=flat-square)](https://github.com/AbdullahMalik17/Digital-FTE)

---

## 🎬 What Is This?

**Digital-FTE** is an open-source autonomous AI agent system that acts as a 24/7 Digital Employee for your personal life and business. It watches your Gmail, WhatsApp, and LinkedIn — drafts replies, creates invoices, posts to social media, and executes tasks — all with **human approval** before any action is taken.

It uses a **Dual-Agent Architecture** (Cloud Sentry + Local Executive) connected by an **Obsidian Vault** as its central nervous system. The system can also **debug and evolve itself** — making it one of the first self-evolving AI employee implementations in open source.

```
📬 Email Arrives → 🤖 Cloud Agent Drafts Reply → 📂 Saved to Vault
→ 📱 You Approve on Phone → ⚡ Local Agent Executes → ✅ Done
```

---

## ✨ Key Features

- **📧 Gmail Watcher** — Monitors inbox, categorizes emails, drafts context-aware replies
- **🏢 Odoo Accounting** — Auto-creates invoices, logs expenses from email receipts
- **📱 Social Media Autopilot** — Posts to Facebook, Instagram, Twitter/X with analytics
- **🧠 Smart Orchestrator** — Routes tasks to the best AI model (Claude 3.5, Gemini 1.5 Pro, etc.)
- **🔐 Human-in-the-Loop** — Nothing executes without your approval. Ever.
- **🔄 Self-Evolution Engine** — Catches its own errors and writes its own patches
- **📂 Obsidian Vault Sync** — Git-synced knowledge base as the system's memory
- **🐳 Docker Ready** — One command deployment with docker-compose
- **🧪 Full Test Suite** — Unit, integration, and E2E tests included

---

## 🏗️ Architecture

The system runs two agents in parallel:

### ☁️ Cloud Agent (The "Sentry")
- **Lives:** On any cloud server or always-on machine
- **Watches:** Gmail (IMAP), LinkedIn API, WhatsApp Web
- **Does:** Reads incoming messages, drafts responses using AI, writes proposals to the Vault
- **Cannot:** Access financial credentials or execute anything — read-only by design

### 💻 Local Agent (The "Executive")
- **Lives:** On your personal machine
- **Syncs:** Git-pulls the Vault every 60 seconds
- **Does:** Notifies you of pending tasks, waits for your approval, then executes via MCP servers
- **Has access to:** Odoo, social media APIs, local files, sensitive credentials

### 🧠 The Orchestrator
The brain that routes every task to the right tool and AI model based on complexity and cost.

```
┌─────────────────────────────────────────────────┐
│                  DIGITAL FTE LOOP               │
│                                                 │
│  📬 Input → ☁️ Cloud Agent → 📂 Vault (Git)     │
│                                  ↓              │
│            ✅ You Approve → 💻 Local Agent       │
│                                  ↓              │
│         ⚡ MCP Execution → 📁 Archive to Done   │
└─────────────────────────────────────────────────┘
```

---

## 🔌 Integrations (via MCP Servers)

| Service | What It Does |
|---|---|
| **Gmail** | Reads, categorizes, drafts context-aware replies |
| **Odoo** | Creates invoices, logs vendor bills, financial summaries |
| **Facebook / Instagram** | Posts content, fetches engagement analytics |
| **Twitter / X** | Posts tweets/threads, monitors mentions |
| **WhatsApp** | Reads messages, drafts replies |
| **Playwright** | Browser automation for web tasks |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker (optional but recommended)
- An Obsidian vault (for the Vault sync)

### 1. Clone the repo
```bash
git clone https://github.com/AbdullahMalik17/Digital-FTE.git
cd Digital-FTE
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure environment
```bash
cp .env.example .env
# Fill in your API keys (see Configuration section below)
```

### 4. Start the system
```bash
# Start the local agent
python src/local_agent.py

# In a separate terminal, start the watchers
python src/service_manager.py
```

### 5. (Optional) Docker deployment
```bash
docker-compose up --build
```

---

## ⚙️ Configuration

Edit your `.env` file with the following:

```env
# AI Models
OPENAI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
GOOGLE_API_KEY=your_key

# Gmail
GMAIL_CLIENT_ID=your_id
GMAIL_CLIENT_SECRET=your_secret

# Odoo (Accounting)
ODOO_URL=https://your-odoo-instance.com
ODOO_USERNAME=your_email
ODOO_PASSWORD=your_password

# Social Media
META_ACCESS_TOKEN=your_token
FACEBOOK_PAGE_ID=your_page_id
INSTAGRAM_ACCOUNT_ID=your_account_id
TWITTER_API_KEY=your_key
TWITTER_API_SECRET=your_secret
TWITTER_BEARER_TOKEN=your_token
```

---

## 📂 Vault Structure

Your Obsidian Vault is organized by task state:

| Folder | Purpose |
|---|---|
| `Needs_Action/` | New incoming triggers awaiting AI draft |
| `Pending_Approval/` | Drafted tasks waiting for your approval |
| `In_Progress/` | Tasks being actively executed |
| `Done/` | Permanent archive of every completed action |
| `Logs/Audit/` | Full JSONL audit trail of every AI call |
| `Plans/` | Long-term strategic goals and breakdowns |

---

## 🧪 Testing

```bash
# Run full test suite
pytest tests/

# Individual test modules
pytest tests/test_odoo_integration.py      # Odoo connection + invoices
pytest tests/test_social_media_apis.py    # Meta + Twitter API tokens
pytest tests/e2e_gold_phase_test.py       # Full Gmail → Odoo → WhatsApp flow
```

---

## 🌱 Self-Evolution Engine

One of the most unique features of Digital-FTE is its **Guardian system**:

1. If any script fails, the traceback is automatically captured
2. The Guardian sends the error + context to the AI
3. The AI writes a patch and proposes it in the Vault
4. You approve → the patch is applied automatically

This means the system gets smarter and more stable over time with minimal manual intervention.

---

## 🗺️ Roadmap

- [ ] WhatsApp Business API (replacing Web scraping)
- [ ] Voice interface integration
- [ ] Multi-user support (team FTE)
- [ ] LangFuse observability dashboard
- [ ] Mobile app for approvals (React Native)
- [ ] Plugin marketplace for custom MCP connectors

---

## 🤝 Contributing

Contributions are very welcome! This is an actively maintained open-source project.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push and open a Pull Request

Please open an issue first for major changes so we can discuss direction.

---

## 👨💻 Author

**Muhammad Abdullah Athar** (AbdullahMalik17)  
Agentic AI Developer | Full-Stack Engineer | Panaversity Agentic AI Program  
📍 Bahawalpur, Pakistan

- 🌐 [Portfolio](https://portfolio-ai-assistant-of-malik.vercel.app/)
- 💼 [LinkedIn](https://www.linkedin.com/in/muhammad-abdullah-athar)
- 📧 [muhammadabdullah51700@gmail.com](mailto:muhammadabdullah51700@gmail.com)

---

## 📄 License

This project is licensed under the MIT License.

---

⭐ **If this project inspires you or saves you time, please give it a star — it helps more developers discover it!**
