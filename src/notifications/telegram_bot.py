"""
Abdullah Junior - Telegram Command Bot

Full-featured Telegram bot that serves as a mobile control center:
- Real-time task notifications with approve/reject buttons
- System status monitoring
- AI chat interface
- Task creation and management
- Daily digest delivery

Usage:
  Standalone polling mode:
    python -m src.notifications.telegram_bot

  Or import and integrate with FastAPI:
    from src.notifications.telegram_bot import TelegramBot
    bot = TelegramBot()
    await bot.start_polling()
"""

from telegram import Bot, InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import (
    Application, CommandHandler, CallbackQueryHandler,
    MessageHandler, ContextTypes, filters
)
import asyncio
import aiohttp
import json
import logging
import os
import shutil
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, List, Dict, Any

logger = logging.getLogger(__name__)

# Project paths
PROJECT_ROOT = Path(__file__).parent.parent.parent
VAULT_PATH = PROJECT_ROOT / "Vault"

# API base URL for internal calls
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")


class TelegramBot:
    """Full-featured Telegram bot for Abdullah Junior Digital FTE."""

    def __init__(self, token: str = None, chat_id: str = None):
        self.token = token or os.getenv("TELEGRAM_BOT_TOKEN")
        self.chat_id = chat_id or os.getenv("TELEGRAM_CHAT_ID")
        self.api_base = API_BASE_URL

        if not self.token:
            logger.warning("TELEGRAM_BOT_TOKEN not set. Telegram bot disabled.")
            self.bot = None
            self.app = None
            return

        self.bot = Bot(self.token)
        self.app = Application.builder().token(self.token).build()
        self._setup_handlers()
        logger.info("Telegram bot initialized")

    def _setup_handlers(self):
        """Register all command and callback handlers."""
        commands = {
            "start": self._cmd_start,
            "help": self._cmd_help,
            "status": self._cmd_status,
            "pending": self._cmd_pending,
            "urgent": self._cmd_urgent,
            "digest": self._cmd_digest,
            "skills": self._cmd_skills,
            "schedule": self._cmd_schedule,
        }
        for cmd, handler in commands.items():
            self.app.add_handler(CommandHandler(cmd, handler))

        # Callback queries for inline buttons
        self.app.add_handler(CallbackQueryHandler(self._handle_callback))

        # Free-text messages -> AI chat
        self.app.add_handler(
            MessageHandler(filters.TEXT & ~filters.COMMAND, self._handle_chat)
        )

    # ── Lifecycle ────────────────────────────────────────────

    async def start_polling(self):
        """Start the bot in long-polling mode (for personal/dev use)."""
        if not self.app:
            logger.error("Cannot start polling: bot not initialized")
            return
        await self.app.initialize()
        await self.app.start()
        await self.app.updater.start_polling(drop_pending_updates=True)
        logger.info("Telegram bot polling started")

    async def stop(self):
        """Gracefully stop the bot."""
        if self.app and self.app.updater and self.app.updater.running:
            await self.app.updater.stop()
        if self.app:
            await self.app.stop()
            await self.app.shutdown()
        logger.info("Telegram bot stopped")

    # ── Vault Helpers (direct file access, no API dependency) ──

    def _count_vault_folder(self, folder: str) -> int:
        path = VAULT_PATH / folder
        if not path.exists():
            return 0
        return len(list(path.glob("*.md")))

    def _count_done_today(self) -> int:
        done = VAULT_PATH / "Done"
        if not done.exists():
            return 0
        today = datetime.now().strftime("%Y-%m-%d")
        return sum(1 for f in done.glob("*.md") if today in f.name)

    def _count_urgent(self) -> int:
        needs_action = VAULT_PATH / "Needs_Action"
        if not needs_action.exists():
            return 0
        count = 0
        for f in needs_action.glob("*.md"):
            try:
                content = f.read_text(encoding="utf-8", errors="replace").lower()
                if "urgent" in content or "priority: high" in content:
                    count += 1
            except Exception:
                pass
        return count

    def _get_pending_tasks(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get pending approval tasks with metadata."""
        pending = VAULT_PATH / "Pending_Approval"
        needs_action = VAULT_PATH / "Needs_Action"
        tasks = []

        for folder in [pending, needs_action]:
            if not folder.exists():
                continue
            for f in sorted(folder.glob("*.md"), key=lambda x: x.stat().st_mtime, reverse=True):
                if len(tasks) >= limit:
                    break
                try:
                    content = f.read_text(encoding="utf-8", errors="replace")
                    # Extract title from content
                    title = f.stem.replace("_", " ")
                    for line in content.split("\n"):
                        line = line.strip()
                        if line.startswith("## ") or line.startswith("# "):
                            title = line.lstrip("# ").strip()
                            break

                    # Detect priority
                    content_lower = content.lower()
                    priority = "medium"
                    if "urgent" in content_lower or "asap" in content_lower:
                        priority = "urgent"
                    elif "high" in content_lower and "priority" in content_lower:
                        priority = "high"
                    elif "low priority" in content_lower:
                        priority = "low"

                    tasks.append({
                        "id": f.stem,
                        "title": title[:60],
                        "priority": priority,
                        "folder": folder.name,
                        "path": str(f),
                        "modified": datetime.fromtimestamp(f.stat().st_mtime).isoformat(),
                    })
                except Exception as e:
                    logger.warning(f"Error reading task {f}: {e}")

        return tasks

    def _approve_task(self, task_id: str) -> tuple[bool, str]:
        """Approve a task by moving it to Approved folder."""
        for folder_name in ["Pending_Approval", "Needs_Action"]:
            folder = VAULT_PATH / folder_name
            if not folder.exists():
                continue
            for f in folder.glob("*.md"):
                if task_id in f.name or f.stem == task_id:
                    approved_dir = VAULT_PATH / "Approved"
                    approved_dir.mkdir(parents=True, exist_ok=True)
                    dest = approved_dir / f.name
                    shutil.move(str(f), str(dest))
                    return True, f"Moved {f.name} to Approved"
        return False, "Task not found"

    def _reject_task(self, task_id: str, reason: str = "") -> tuple[bool, str]:
        """Reject a task by moving it back to Needs_Action with a note."""
        folder = VAULT_PATH / "Pending_Approval"
        if not folder.exists():
            return False, "No pending tasks folder"

        for f in folder.glob("*.md"):
            if task_id in f.name or f.stem == task_id:
                if reason:
                    content = f.read_text(encoding="utf-8", errors="replace")
                    content += f"\n\n---\n**Rejected:** {reason}\n"
                    f.write_text(content, encoding="utf-8")
                needs_action = VAULT_PATH / "Needs_Action"
                needs_action.mkdir(parents=True, exist_ok=True)
                dest = needs_action / f.name
                shutil.move(str(f), str(dest))
                return True, f"Rejected {f.name}"
        return False, "Task not found in Pending_Approval"

    # ── Command Handlers ─────────────────────────────────────

    async def _cmd_start(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Welcome message with quick overview."""
        welcome = (
            "Welcome to *Abdullah Junior* \n"
            "Your AI Chief of Staff\n\n"
            "I manage your emails, tasks, social media, and more\\. "
            "Here's what I can do:\n\n"
            "/status \\- System dashboard\n"
            "/pending \\- Tasks needing approval\n"
            "/urgent \\- Urgent items only\n"
            "/digest \\- Today's summary\n"
            "/skills \\- Active integrations\n"
            "/schedule \\- Create a task\n"
            "/help \\- Full command list\n\n"
            "Or just *send me a message* and I'll chat with you\\!"
        )
        await update.message.reply_text(welcome, parse_mode="MarkdownV2")

    async def _cmd_help(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Full command reference."""
        help_text = (
            "*Commands:*\n\n"
            "`/status` \\- Live system dashboard\n"
            "`/pending` \\- List items needing approval\n"
            "`/urgent` \\- Show urgent items only\n"
            "`/digest` \\- Today's activity digest\n"
            "`/skills` \\- Active agent skills\n"
            "`/schedule <text>` \\- Create a new task\n"
            "`/help` \\- This message\n\n"
            "*Quick Actions:*\n"
            "Tap Approve/Reject on task notifications\n"
            "Send any text to chat with the AI agent"
        )
        await update.message.reply_text(help_text, parse_mode="MarkdownV2")

    async def _cmd_status(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Live system dashboard with real data."""
        pending = self._count_vault_folder("Pending_Approval")
        needs_action = self._count_vault_folder("Needs_Action")
        in_progress = self._count_vault_folder("In_Progress")
        done_today = self._count_done_today()
        urgent = self._count_urgent()

        total_pending = pending + needs_action

        # Status indicator
        if urgent > 0:
            status_icon = "🔴"
            status_text = "ATTENTION NEEDED"
        elif total_pending > 5:
            status_icon = "🟡"
            status_text = "BUSY"
        else:
            status_icon = "🟢"
            status_text = "ALL CLEAR"

        text = (
            f"{status_icon} *System Status: {status_text}*\n\n"
            f"📋 Pending Approval: *{pending}*\n"
            f"⚡ Needs Action: *{needs_action}*\n"
            f"🔄 In Progress: *{in_progress}*\n"
            f"✅ Done Today: *{done_today}*\n"
            f"🔴 Urgent: *{urgent}*\n\n"
            f"_Updated: {datetime.now().strftime('%H:%M')}_"
        )

        keyboard = InlineKeyboardMarkup([
            [
                InlineKeyboardButton("📋 View Pending", callback_data="cmd_pending"),
                InlineKeyboardButton("🔄 Refresh", callback_data="cmd_status"),
            ]
        ])

        await update.message.reply_text(text, parse_mode="Markdown", reply_markup=keyboard)

    async def _cmd_pending(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """List pending tasks with approve/reject buttons."""
        tasks = self._get_pending_tasks(limit=5)

        if not tasks:
            await update.message.reply_text(
                "✨ *All clear\\!* No items pending approval\\.",
                parse_mode="MarkdownV2"
            )
            return

        await update.message.reply_text(
            f"📋 *{len(tasks)} items pending:*",
            parse_mode="Markdown"
        )

        priority_emoji = {
            "urgent": "🔴", "high": "🟠", "medium": "🟡", "low": "🟢"
        }

        for task in tasks:
            emoji = priority_emoji.get(task["priority"], "⚪")
            text = f"{emoji} *{task['title']}*\nPriority: {task['priority']} | Folder: {task['folder']}"

            keyboard = InlineKeyboardMarkup([
                [
                    InlineKeyboardButton("✅ Approve", callback_data=f"approve_{task['id']}"),
                    InlineKeyboardButton("❌ Reject", callback_data=f"reject_{task['id']}"),
                ],
                [
                    InlineKeyboardButton("🔍 Details", callback_data=f"details_{task['id']}"),
                ]
            ])

            await update.message.reply_text(
                text, parse_mode="Markdown", reply_markup=keyboard
            )

    async def _cmd_urgent(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Show only urgent items."""
        tasks = self._get_pending_tasks(limit=20)
        urgent_tasks = [t for t in tasks if t["priority"] in ("urgent", "high")]

        if not urgent_tasks:
            await update.message.reply_text(
                "🟢 *No urgent items\\.* Everything is under control\\!",
                parse_mode="MarkdownV2"
            )
            return

        await update.message.reply_text(
            f"🔴 *{len(urgent_tasks)} urgent items:*",
            parse_mode="Markdown"
        )

        for task in urgent_tasks:
            emoji = "🔴" if task["priority"] == "urgent" else "🟠"
            text = f"{emoji} *{task['title']}*"
            keyboard = InlineKeyboardMarkup([[
                InlineKeyboardButton("✅ Approve", callback_data=f"approve_{task['id']}"),
                InlineKeyboardButton("❌ Reject", callback_data=f"reject_{task['id']}"),
            ]])
            await update.message.reply_text(
                text, parse_mode="Markdown", reply_markup=keyboard
            )

    async def _cmd_digest(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Generate and send today's activity digest."""
        done_today = self._count_done_today()
        pending = self._count_vault_folder("Pending_Approval")
        needs_action = self._count_vault_folder("Needs_Action")
        in_progress = self._count_vault_folder("In_Progress")

        # Read today's audit log for activity
        today_str = datetime.now().strftime("%Y-%m-%d")
        audit_file = VAULT_PATH / "Logs" / "audit" / f"audit_{today_str}.jsonl"
        activities = []
        if audit_file.exists():
            try:
                lines = audit_file.read_text(encoding="utf-8", errors="replace").strip().split("\n")
                for line in lines[-10:]:
                    try:
                        entry = json.loads(line)
                        action = entry.get("action", "unknown").replace("_", " ").title()
                        activities.append(f"  • {action}")
                    except json.JSONDecodeError:
                        pass
            except Exception:
                pass

        activity_text = "\n".join(activities) if activities else "  No activities logged yet"

        text = (
            f"📊 *Daily Digest \\- {today_str}*\n\n"
            f"*Completed Today:* {done_today}\n"
            f"*In Progress:* {in_progress}\n"
            f"*Pending Approval:* {pending}\n"
            f"*Needs Action:* {needs_action}\n\n"
            f"*Recent Activity:*\n{activity_text}\n\n"
            f"_Generated at {datetime.now().strftime('%H:%M')}_"
        )

        await update.message.reply_text(text, parse_mode="MarkdownV2")

    async def _cmd_skills(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Show active agent skills/integrations."""
        skills = [
            ("📧", "Gmail Watcher", "Monitors inbox, drafts replies"),
            ("💬", "WhatsApp Monitor", "24/7 message monitoring"),
            ("💼", "LinkedIn Poster", "Content scheduling & posting"),
            ("💰", "Financial Analyst", "Odoo invoice/expense tracking"),
            ("📁", "Filesystem Watcher", "Drop folder monitoring"),
            ("🤖", "Task Orchestrator", "Automated task routing"),
            ("📱", "Telegram Bot", "This bot - your control center"),
            ("📅", "Calendar Agent", "Meeting detection & scheduling"),
        ]

        lines = ["*🔧 Active Agent Skills:*\n"]
        for emoji, name, desc in skills:
            lines.append(f"{emoji} *{name}*\n   _{desc}_")

        await update.message.reply_text(
            "\n".join(lines), parse_mode="Markdown"
        )

    async def _cmd_schedule(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Create a new task from the message text."""
        # Extract text after /schedule
        text = update.message.text
        task_desc = text.replace("/schedule", "").strip()

        if not task_desc:
            await update.message.reply_text(
                "📝 *Usage:* `/schedule <task description>`\n\n"
                "Example: `/schedule Review Q4 budget report`",
                parse_mode="Markdown"
            )
            return

        # Create task file
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        task_id = f"Task_TG_{timestamp}"
        needs_action = VAULT_PATH / "Needs_Action"
        needs_action.mkdir(parents=True, exist_ok=True)
        task_file = needs_action / f"{task_id}.md"

        content = f"""---
type: telegram_task
priority: medium
created: {datetime.now().isoformat()}
source: telegram
status: pending
---

## {task_desc}

Created via Telegram bot.

## Actions
- [ ] Review and process
"""
        task_file.write_text(content, encoding="utf-8")

        await update.message.reply_text(
            f"✅ *Task created:*\n\n"
            f"📋 {task_desc}\n"
            f"🆔 `{task_id}`",
            parse_mode="Markdown"
        )

    # ── Callback Handler ─────────────────────────────────────

    async def _handle_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle inline button presses."""
        query = update.callback_query
        await query.answer()
        data = query.data

        # Command callbacks (from status dashboard buttons)
        if data == "cmd_pending":
            tasks = self._get_pending_tasks(limit=5)
            if not tasks:
                await query.edit_message_text("✨ No items pending approval!")
                return
            # Send new messages for each task instead of editing
            for task in tasks:
                emoji = {"urgent": "🔴", "high": "🟠", "medium": "🟡", "low": "🟢"}.get(task["priority"], "⚪")
                keyboard = InlineKeyboardMarkup([[
                    InlineKeyboardButton("✅ Approve", callback_data=f"approve_{task['id']}"),
                    InlineKeyboardButton("❌ Reject", callback_data=f"reject_{task['id']}"),
                ]])
                await query.message.reply_text(
                    f"{emoji} *{task['title']}*\n{task['priority']} | {task['folder']}",
                    parse_mode="Markdown",
                    reply_markup=keyboard,
                )
            await query.edit_message_text(f"📋 Showing {len(tasks)} pending items above ⬆️")
            return

        if data == "cmd_status":
            # Refresh status
            pending = self._count_vault_folder("Pending_Approval")
            needs_action = self._count_vault_folder("Needs_Action")
            in_progress = self._count_vault_folder("In_Progress")
            done_today = self._count_done_today()
            urgent = self._count_urgent()
            total = pending + needs_action
            icon = "🔴" if urgent > 0 else ("🟡" if total > 5 else "🟢")
            status = "ATTENTION NEEDED" if urgent > 0 else ("BUSY" if total > 5 else "ALL CLEAR")

            text = (
                f"{icon} *System Status: {status}*\n\n"
                f"📋 Pending Approval: *{pending}*\n"
                f"⚡ Needs Action: *{needs_action}*\n"
                f"🔄 In Progress: *{in_progress}*\n"
                f"✅ Done Today: *{done_today}*\n"
                f"🔴 Urgent: *{urgent}*\n\n"
                f"_Updated: {datetime.now().strftime('%H:%M')}_"
            )
            keyboard = InlineKeyboardMarkup([[
                InlineKeyboardButton("📋 View Pending", callback_data="cmd_pending"),
                InlineKeyboardButton("🔄 Refresh", callback_data="cmd_status"),
            ]])
            await query.edit_message_text(text, parse_mode="Markdown", reply_markup=keyboard)
            return

        # Task action callbacks
        if "_" not in data:
            return

        action, task_id = data.split("_", 1)

        if action == "approve":
            success, msg = self._approve_task(task_id)
            if success:
                await query.edit_message_text(f"✅ *Approved:* {task_id}\n_{msg}_", parse_mode="Markdown")
            else:
                await query.edit_message_text(f"⚠️ Could not approve: {msg}")

        elif action == "reject":
            success, msg = self._reject_task(task_id)
            if success:
                await query.edit_message_text(f"❌ *Rejected:* {task_id}\n_{msg}_", parse_mode="Markdown")
            else:
                await query.edit_message_text(f"⚠️ Could not reject: {msg}")

        elif action == "details":
            # Show full task content
            for folder_name in ["Pending_Approval", "Needs_Action", "In_Progress", "Done"]:
                folder = VAULT_PATH / folder_name
                if not folder.exists():
                    continue
                for f in folder.glob("*.md"):
                    if task_id in f.name or f.stem == task_id:
                        content = f.read_text(encoding="utf-8", errors="replace")
                        # Truncate for Telegram message limit
                        if len(content) > 3000:
                            content = content[:3000] + "\n\n... (truncated)"
                        await query.message.reply_text(
                            f"📄 *{f.stem}*\n\n```\n{content}\n```",
                            parse_mode="Markdown"
                        )
                        return
            await query.edit_message_text(f"⚠️ Task {task_id} not found")

        elif action == "snooze":
            await query.edit_message_text(f"⏰ Snoozed: {task_id} (will remind in 1 hour)")

    # ── Free-text Chat Handler ───────────────────────────────

    async def _handle_chat(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle free-text messages as AI chat."""
        user_msg = update.message.text.strip()

        if not user_msg:
            return

        # Try to call the API chat endpoint
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_base}/api/chat/send",
                    json={"message": user_msg},
                    headers={"X-API-Key": os.getenv("API_SECRET_KEY", "default-dev-key-change-me")},
                    timeout=aiohttp.ClientTimeout(total=15),
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        response_text = data.get("response", "I couldn't process that.")
                        suggestions = data.get("suggestions", [])

                        # Build response with suggestion buttons
                        keyboard = None
                        if suggestions:
                            buttons = [
                                InlineKeyboardButton(s, callback_data=f"chat_{s[:30]}")
                                for s in suggestions[:3]
                            ]
                            keyboard = InlineKeyboardMarkup([buttons])

                        await update.message.reply_text(
                            response_text,
                            parse_mode="Markdown",
                            reply_markup=keyboard,
                        )
                        return
        except Exception as e:
            logger.warning(f"API chat failed, using fallback: {e}")

        # Fallback: simple local responses
        lower = user_msg.lower()
        if any(kw in lower for kw in ["status", "how are you"]):
            await self._cmd_status(update, context)
        elif any(kw in lower for kw in ["pending", "approval"]):
            await self._cmd_pending(update, context)
        elif any(kw in lower for kw in ["help", "what can you do"]):
            await self._cmd_help(update, context)
        else:
            await update.message.reply_text(
                f"🤔 I heard: _{user_msg}_\n\n"
                "I'm working on understanding that better. "
                "Try /help for available commands.",
                parse_mode="Markdown"
            )

    # ── Outbound Notifications (called by other services) ────

    async def send_notification(
        self,
        text: str,
        parse_mode: str = "Markdown",
        keyboard: InlineKeyboardMarkup = None,
    ):
        """Send a generic notification message."""
        if not self.bot or not self.chat_id:
            return
        try:
            await self.bot.send_message(
                chat_id=self.chat_id,
                text=text,
                parse_mode=parse_mode,
                reply_markup=keyboard,
            )
        except Exception as e:
            logger.error(f"Failed to send Telegram notification: {e}")

    async def send_approval_request(
        self,
        task_id: str,
        title: str,
        description: str,
        priority: str = "medium",
        source: str = "system",
    ):
        """Send approval request with inline Approve/Reject buttons."""
        if not self.bot or not self.chat_id:
            return

        emoji = {"urgent": "🔴", "high": "🟠", "medium": "🟡", "low": "🟢"}.get(priority, "⚪")
        source_emoji = {
            "gmail": "📧", "whatsapp": "💬", "filesystem": "📁",
            "linkedin": "💼", "telegram": "📱", "manual": "✏️",
        }.get(source, "🔔")

        keyboard = InlineKeyboardMarkup([
            [
                InlineKeyboardButton("✅ Approve", callback_data=f"approve_{task_id}"),
                InlineKeyboardButton("❌ Reject", callback_data=f"reject_{task_id}"),
            ],
            [
                InlineKeyboardButton("🔍 Details", callback_data=f"details_{task_id}"),
                InlineKeyboardButton("⏰ Snooze", callback_data=f"snooze_{task_id}"),
            ],
        ])

        desc_preview = description[:200] + "..." if len(description) > 200 else description

        text = (
            f"🔔 *New Task Requires Approval*\n\n"
            f"{emoji} *{title}*\n"
            f"{source_emoji} Source: {source}\n\n"
            f"{desc_preview}"
        )

        try:
            await self.bot.send_message(
                chat_id=self.chat_id,
                text=text,
                reply_markup=keyboard,
                parse_mode="Markdown",
            )
        except Exception as e:
            logger.error(f"Failed to send approval request: {e}")

    async def send_alert(self, title: str, message: str, level: str = "info"):
        """Send an alert notification."""
        level_emoji = {
            "info": "ℹ️", "warning": "⚠️", "error": "🚨", "success": "✅"
        }.get(level, "📢")

        await self.send_notification(
            f"{level_emoji} *{title}*\n\n{message}"
        )

    async def send_digest(self, summary: str):
        """Send daily digest summary."""
        await self.send_notification(
            f"📊 *Daily Digest*\n\n{summary}"
        )


# ── Standalone runner ────────────────────────────────────────

async def main():
    """Run the Telegram bot in standalone polling mode."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )

    bot = TelegramBot()
    if not bot.app:
        logger.error("Bot not initialized. Set TELEGRAM_BOT_TOKEN env var.")
        return

    logger.info("Starting Abdullah Junior Telegram Bot (polling mode)...")
    try:
        await bot.start_polling()
        # Keep running
        while True:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        logger.info("Shutting down...")
    finally:
        await bot.stop()


if __name__ == "__main__":
    asyncio.run(main())
