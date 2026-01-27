# Abdullah Junior: The Elite Digital FTE (Full-Time Equivalent)

**"Your life and business on autopilot. Cloud-native, robust APIs, secure by design."**

Abdullah Junior is a high-autonomy AI agent system designed for the 2026 Personal AI Employee Hackathon. It proactively manages personal and business affairs 24/7 using a sophisticated multi-agent architecture.

## 🚀 Elite Platinum Tier Features

- **Robust Connectivity:** Migrated from brittle browser automation to **Official WhatsApp Cloud API** and robust LinkedIn API for 24/7 reliability.
- **Hybrid Cloud + Local:** Always-on Cloud Agent (Fly.io/GCP) for monitoring, and Local Agent (Laptop) for secure execution and payments.
- **Biometric Security:** Mobile app protected by FaceID/Fingerprint authentication.
- **Voice-Enabled Agent:** Command your Digital FTE using native voice recordings from your mobile device.
- **Secure Cloud API:** All remote communication protected by `X-API-Key` headers and encrypted secrets.
- **Self-Healing Logic:** A "Guardian" system that detects script crashes, asks the AI for fixes, and recovers automatically.
- **Dynamic Skill Registry:** View and manage specialized agent personas (Communicator, Auditor, Financial Analyst) directly from the mobile app.

## 🛠 Tech Stack

- **Reasoning Engine:** Gemini Pro / Claude 3.5 via Agentic Orchestrator.
- **Memory/GUI:** Next.js Cloud Dashboard & Synced Obsidian Vault.
- **Communication:** Official WhatsApp Cloud API (Meta), Gmail API, LinkedIn Robust Client.
- **Security:** FastAPI Middleware (API Key), Biometric Authentication, `NO_AI` Privacy Filters.
- **Deployment:** Docker (Cloud Agent), Vercel (Frontend), Expo/React Native (Mobile).

## 🔒 Security & Privacy

- **Zero Trust Cloud:** The Cloud Agent has zero sensitive credentials. High-risk actions (Banking, Sending WhatsApp) require Local Agent approval.
- **Encrypted Secrets:** All API tokens are injected as encrypted environment variables (Fly Secrets / GCP).
- **Privacy Mode:** Any Gmail thread labeled **`NO_AI`** is strictly ignored and never processed by the system.
- **Local Vault:** Your task history and memory reside in your private Obsidian Vault, synced via encrypted Git.

## 📦 Deployment

### Cloud Agent (Fly.io / GCP)
Follow the [Platinum Deployment Guide](docs/PLATINUM_DEPLOYMENT.md) to set up your 24/7 brain.
- **Fly.io**: Use `fly deploy`.
- **GCP**: Follow the [GCP VM Setup](docs/setup/GCP_DEPLOYMENT.md).

### Cloud Dashboard (Vercel)
The [Next.js Dashboard](frontend/) is stateless and ready for Vercel. Set `NEXT_PUBLIC_API_URL` and `API_SECRET_KEY` in settings.

### Mobile App (EAS)
```bash
cd mobile
eas build --profile preview --platform android
```

## 📖 Documentation Index

- [USER_GUIDE.md](docs/USER_GUIDE.md): How to use the system day-to-day.
- [WHATSAPP_CLOUD_SETUP.md](docs/setup/WHATSAPP_CLOUD_SETUP.md): Step-by-step Meta API guide.
- [CREDENTIALS_GUIDE.md](docs/CREDENTIALS_GUIDE.md): Setup for Gmail, Twitter, and Odoo.

---
*Built for the 2026 AI Employee Hackathon. Autonomous. Secure. Robust.*

## 🌟 World's First Self-Evolving AI Employee

This project introduces the **world's first Self-Evolving AI Employee** - an AI system capable of autonomous self-improvement without human intervention. The system features:

### Revolutionary Self-Evolution Engine
- **Autonomous Code Analysis**: AI analyzes its own codebase to identify improvement opportunities.
- **Self-Modification**: Generates and applies improvements to its own code.
- **Validation Framework**: Ensures functionality is preserved during evolution.

### Self-Directed Learning System
- **Skill Acquisition**: AI autonomously learns new capabilities.
- **Mastery Assessment**: Evaluates its own skill proficiency levels.
- **Knowledge Synthesis**: Creates new insights by combining existing knowledge.
