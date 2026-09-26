# 🏛️ Digital-FTE (Hacathan_2) System Architecture & Multi-Agent Map

This document outlines the architecture, directory mapping, and multi-agent execution flow of **Digital-FTE** (Abdullah Junior) enhanced with **MalikClaw's High-Performance Go Orchestrator Engine**.

---

## 📐 Dual-Agent System Architecture

```
                               ┌─────────────────────────────┐
                               │   📬 External Triggers      │
                               │  (Gmail, WhatsApp, LinkedIn)│
                               └──────────────┬──────────────┘
                                              │
                                              ▼
                               ┌─────────────────────────────┐
                               │   ☁️ Cloud Sentry Agent      │
                               │ (Read-Only Listener / Draft)│
                               └──────────────┬──────────────┘
                                              │
                                              ▼
                               ┌─────────────────────────────┐
                               │   📂 Obsidian Vault (Git)   │
                               │  (Human Approval Queue)     │
                               └──────────────┬──────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────┴─────────────────────────────────────────────┐
│                       ⚡ MalikClaw Multi-Agent Go Engine                                   │
│                                                                                           │
│ ┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐             │
│ │   📁 Dir Navigator   │──►│ ⚙️ Refactor Engineer │──►│ 🔌 MCP Tool Bridge   │             │
│ └──────────────────────┘   └──────────────────────┘   └──────────┬───────────┘             │
└──────────────────────────────────────────────────────────────────┼────────────────────────┘
                                                                   │
                                                                   ▼
                               ┌───────────────────────────────────┴───────────────────────┐
                               │               💻 Local Executive Operations               │
                               │  (Odoo Accounting, Playwright Browser, Social Connectors) │
                               └───────────────────────────────────────────────────────────┘
```

---

## 📂 Codebase Directory Hierarchy

```
Hacathan_2/
├── docs/                    # Technical documentation and architecture specs
├── frontend/                # Web dashboard UI
├── mobile/                  # Mobile application endpoints
├── specs/                   # Project feature specifications
├── src/
│   ├── agents/              # Cloud and Local executive agent loops
│   ├── bridges/             # Inter-process communication & Go engine bridges
│   ├── evolution/           # Guardian self-healing & patch generator
│   ├── integrations/        # External API connectors (Slack, Matrix, Email)
│   ├── intelligence/       # LLM router and model scoring
│   ├── mcp_servers/         # Standardized MCP JSON-RPC tool servers (Odoo, Calendar, Social)
│   ├── monitoring/          # System health and logging telemetry
│   ├── orchestrator.py      # Core decision & task dispatch loop
│   └── watchers/            # Background email, LinkedIn, and WhatsApp listeners
├── tests/                   # Pytest integration and unit test suite
└── tools/                   # Utility scripts and browser automation helpers
```

---

## 🔒 Security & Approval Model

1. **Cloud Sentry (Read-Only)**: Collects incoming notifications, generates response drafts, and writes proposals into the Vault. Cannot execute transactions or access credentials.
2. **Human Approval**: The user reviews pending proposals in the Vault or via mobile notification.
3. **Local Executive (Execution)**: Executes approved tasks via sandboxed MCP servers with strict parameter validation.
