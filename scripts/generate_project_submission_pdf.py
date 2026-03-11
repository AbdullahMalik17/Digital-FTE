from __future__ import annotations

from datetime import date
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    Image,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


REPO_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PDF = REPO_ROOT / "docs" / "Project_Submission_Digital-FTE.pdf"
BANNER_IMG = REPO_ROOT / "digital-fte-banner.png"


def _title(styles):
    return ParagraphStyle(
        name="DFTE_Title",
        parent=styles["Title"],
        fontSize=22,
        leading=26,
        spaceAfter=14,
    )


def _h1(styles):
    return ParagraphStyle(
        name="DFTE_H1",
        parent=styles["Heading1"],
        fontSize=16,
        leading=20,
        spaceBefore=10,
        spaceAfter=8,
    )


def _body(styles):
    return ParagraphStyle(
        name="DFTE_Body",
        parent=styles["BodyText"],
        fontSize=10.5,
        leading=14,
    )


def _bullet(styles):
    return ParagraphStyle(
        name="DFTE_Bullet",
        parent=_body(styles),
        leftIndent=14,
        bulletIndent=6,
        spaceBefore=2,
        spaceAfter=2,
    )


def _kv_table(rows: list[list[str]]):
    table = Table(rows, colWidths=[4.2 * cm, 12.8 * cm])
    table.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#2B2F36")),
                ("INNERGRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#2B2F36")),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0B1220")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("PADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    return table


def build_pdf() -> Path:
    OUTPUT_PDF.parent.mkdir(parents=True, exist_ok=True)

    styles = getSampleStyleSheet()
    title = _title(styles)
    h1 = _h1(styles)
    body = _body(styles)
    bullet = _bullet(styles)

    doc = SimpleDocTemplate(
        str(OUTPUT_PDF),
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=1.8 * cm,
        bottomMargin=1.8 * cm,
        title="Digital-FTE Project Submission",
        author="Digital-FTE",
    )

    story = []

    if BANNER_IMG.exists():
        story.append(Image(str(BANNER_IMG), width=17.0 * cm, height=6.2 * cm))
        story.append(Spacer(1, 10))

    story.append(Paragraph("Digital-FTE — Project Submission", title))
    story.append(
        Paragraph(
            f"Generated on <b>{date.today().isoformat()}</b> from repository documentation.",
            body,
        )
    )
    story.append(Spacer(1, 10))

    story.append(
        _kv_table(
            [
                ["Field", "Details"],
                ["Project name", "Digital-FTE (Faculty Time & Task Efficiency System)"],
                ["Type", "Open-source autonomous AI agent system (Human-in-the-Loop)"],
                ["Core value", "24/7 Digital Employee that drafts + routes tasks with approval gates"],
                ["Primary services", "Gmail, WhatsApp, LinkedIn, Odoo Accounting, Social posting"],
                ["Deployment", "Local + Cloud dual-agent architecture; Docker supported"],
                ["Repository", "https://github.com/AbdullahMalik17/Digital-FTE"],
            ]
        )
    )

    story.append(Spacer(1, 14))
    story.append(Paragraph("1) Problem & Motivation", h1))
    story.append(
        Paragraph(
            "Professionals waste hours daily on repetitive communication and admin tasks: "
            "triaging inboxes, drafting replies, tracking follow-ups, generating invoices, "
            "and posting updates. Most automation tools either lack context or require full trust.",
            body,
        )
    )
    story.append(Spacer(1, 8))
    story.append(
        Paragraph(
            "<b>Digital-FTE</b> addresses this by combining autonomy with safety: "
            "it drafts actions and organizes work automatically, but nothing executes without explicit approval.",
            body,
        )
    )

    story.append(Spacer(1, 14))
    story.append(Paragraph("2) Solution Overview", h1))
    story.append(
        Paragraph(
            "Digital-FTE is a dual-agent system (Cloud Sentry + Local Executive) connected through an "
            "Obsidian Vault. The cloud side observes and drafts; the local side executes only after approval.",
            body,
        )
    )
    story.append(Spacer(1, 6))
    for t in [
        "Email/message arrives → Cloud Agent drafts response/task → Saved to Vault",
        "User approves on device → Local Agent executes via MCP tools → Archived as Done",
        "If something fails, the Self‑Evolution Engine proposes patches for human approval",
    ]:
        story.append(Paragraph(t, bullet, bulletText="•"))

    story.append(Spacer(1, 14))
    story.append(Paragraph("3) Key Features", h1))
    for t in [
        "Gmail Watcher: monitor inbox, categorize, draft context-aware replies",
        "Odoo Accounting: create invoices and log expenses from email receipts",
        "Social Media Autopilot: post to Meta (Facebook/Instagram) and Twitter/X with analytics",
        "Smart Orchestrator: routes tasks to the best model/tool based on complexity and cost",
        "Human-in-the-Loop: no execution without approval",
        "Self‑Evolution Engine: captures tracebacks and proposes patches",
        "Obsidian Vault Sync: git-synced memory and task workflow",
        "Docker-ready deployment",
    ]:
        story.append(Paragraph(t, bullet, bulletText="•"))

    story.append(PageBreak())
    story.append(Paragraph("4) Architecture (High Level)", h1))
    story.append(
        Paragraph(
            "<b>Cloud Agent (Sentry)</b>: always-on, read-only where possible. Watches channels, drafts actions, "
            "writes proposals to the Vault.<br/>"
            "<b>Local Agent (Executive)</b>: runs on the operator’s machine, holds sensitive credentials, "
            "pulls Vault changes, requests approval, then executes tasks via MCP servers.<br/>"
            "<b>Orchestrator</b>: routes tasks and selects tools/models.",
            body,
        )
    )

    story.append(Spacer(1, 14))
    story.append(Paragraph("5) Integrations", h1))
    story.append(
        _kv_table(
            [
                ["Service", "What it does"],
                ["Gmail", "Reads, categorizes, drafts replies"],
                ["Odoo", "Invoices, vendor bills, summaries"],
                ["Facebook / Instagram", "Posts content + engagement analytics"],
                ["Twitter/X", "Posts tweets/threads, monitors mentions"],
                ["WhatsApp", "Reads messages, drafts replies"],
                ["Playwright", "Browser automation for web tasks"],
            ]
        )
    )

    story.append(Spacer(1, 14))
    story.append(Paragraph("6) Setup & Run (Quick Start)", h1))
    story.append(Paragraph("Prerequisites: Python 3.10+, Node.js 18+, Docker optional.", body))
    story.append(Spacer(1, 6))
    for t in [
        "Clone: git clone https://github.com/AbdullahMalik17/Digital-FTE.git",
        "Install: pip install -r requirements.txt",
        "Configure: cp .env.example .env (fill keys for Gmail/Odoo/Social)",
        "Run local agent: python src/local_agent.py",
        "Run watchers: python src/service_manager.py",
        "Optional Docker: docker-compose up --build",
    ]:
        story.append(Paragraph(t, bullet, bulletText="•"))

    story.append(Spacer(1, 14))
    story.append(Paragraph("7) Demo Flow (For Judges)", h1))
    for t in [
        "Trigger: send a test email to the connected Gmail account",
        "Observe: Cloud agent drafts a reply/task and writes it to the Vault",
        "Approve: mark the task Approved (mobile/desktop)",
        "Execute: local agent runs the action (e.g., draft reply, create invoice, post update)",
        "Verify: task archived in Done + audit trail stored",
    ]:
        story.append(Paragraph(t, bullet, bulletText="•"))

    story.append(Spacer(1, 14))
    story.append(Paragraph("8) Safety & Trust Model", h1))
    for t in [
        "Approval gate before any side-effect execution",
        "Principle of least privilege: cloud side is read-only where possible",
        "Secrets kept locally in environment variables; avoid hardcoding tokens",
        "Auditable: Vault + logs provide traceability",
    ]:
        story.append(Paragraph(t, bullet, bulletText="•"))

    story.append(Spacer(1, 14))
    story.append(Paragraph("9) Links", h1))
    story.append(
        Paragraph(
            "Repository: <b>https://github.com/AbdullahMalik17/Digital-FTE</b><br/>"
            "CI badge and documentation are available on the README.",
            body,
        )
    )

    doc.build(story)
    return OUTPUT_PDF


if __name__ == "__main__":
    out = build_pdf()
    print(str(out))

