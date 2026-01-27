# Digital FTE - User Manual (Platinum Tier)

Welcome to your Digital FTE, **Abdullah Junior**. This autonomous agent manages your emails, files, WhatsApp messages, social media, and accounting 24/7.

## 🚀 Quick Start

### 1. Launch the System
```powershell
./Launch_Abdullah_Junior.ps1
```
This starts:
- **Orchestrator**: The brain processing tasks.
- **Frontend Dashboard**: Visual interface at `http://localhost:3000`.
- **Watchers**: Background monitors for Gmail, Files, WhatsApp.

### 2. Configure Credentials
Edit `config/.env`:
- **WhatsApp**: Requires scanning QR code in the browser window on first run.
- **Gmail/Calendar**: Requires `credentials.json` from Google Cloud.
- **Odoo**: Set `ODOO_URL`, `ODOO_USERNAME`, `ODOO_PASSWORD`.
- **Social**: Set tokens for Meta/Twitter.

---

## 🖥️ Using the Dashboard

Access at `http://localhost:3000`.

### Command Chat
- Type natural language commands: "Draft an invoice for Client X for $500", "Post update to LinkedIn about our new feature".
- Set priority (Low/Medium/High/Urgent).

### Live Terminal
- Watch real-time logs of the agent's thinking process and actions.

### Task Board
- **Pending**: Items waiting for action or human approval.
- **Completed**: History of executed tasks.

### Widgets
- **Financial Health**: Real-time Revenue/Expense/Profit from Odoo.
- **Social Pulse**: Engagement stats from Twitter/LinkedIn/Meta.

---

## 🤖 Capabilities

### 📧 Email & Calendar
- **Monitor**: Reads emails, categorizes priority.
- **Respond**: Drafts replies (auto-sends to known contacts if enabled).
- **Calendar**: "Schedule a meeting with X on Tuesday" -> Checks availability and creates event.

### 💬 WhatsApp
- **Monitor**: Reads messages. Escalate urgent ones from unknown numbers.
- **Reply**: Auto-replies to known contacts (24h cooldown).
- **Send**: "WhatsApp Alice that I'm running late" -> Queues message.

### 💼 Accounting (Odoo)
- **Invoicing**: "Create invoice for Acme Corp for Web Design, qty 1, price 1000".
- **Expenses**: "Record bill from AWS for Hosting, $50".
- **Reporting**: Weekly CEO Briefing includes real-time P&L.

### 📱 Social Media
- **LinkedIn**: Auto-generates posts from weekly updates.
- **Twitter/Meta**: Posts updates, tracks engagement.

---

## 🛡️ Privacy Controls

### Gmail: The "NO_AI" Label
To prevent the agent from reading specific sensitive emails:
1.  Open Gmail.
2.  Create a new label named **`NO_AI`**.
3.  Apply this label to any email thread you want to hide.
4.  **Result**: The agent will strictly ignore these emails (they won't even appear in the logs).

---

## ☁️ Platinum Features (Cloud/Local)

- **Cloud Mode (Fly.io)**: Runs 24/7. Monitors Gmail/Files and creates Drafts.
    - **Security**: Protected by `X-API-Key` authentication.
    - **Secrets**: Credentials (like Gmail Token) are injected securely via Fly Secrets.
- **Local Mode (Laptop)**: Runs when you work. Approves tasks and executes final actions (Payments, WhatsApp sending).
- **Sync**: Git-based sync keeps both agents in step every 5 minutes.

---

## 🛠️ Troubleshooting

**Logs**: Check `Vault/Logs/YYYY-MM-DD.json` for detailed execution history.
**Restart**: If a service hangs, the Service Manager auto-restarts it. Run `python src/service_manager.py --status` to check.
