"""
Inbox Triage Agent

Monitors incoming messages from Gmail, WhatsApp, and Telegram.
Categorizes by urgency, routes to appropriate handler, and sends
notifications for items requiring human attention.
"""

import logging
import re
from datetime import datetime
from pathlib import Path
from typing import Optional

from .base import BaseAgent, AgentMessage, VAULT_PATH

logger = logging.getLogger(__name__)

# Keywords that indicate urgency
URGENT_KEYWORDS = [
    "urgent", "asap", "emergency", "critical", "deadline",
    "immediately", "time-sensitive", "action required",
]

HIGH_KEYWORDS = [
    "important", "priority", "follow up", "waiting on",
    "decision needed", "approval needed", "review needed",
]

LOW_KEYWORDS = [
    "newsletter", "promotion", "unsubscribe", "no-reply",
    "notification", "automated", "digest",
]

# Contact list for auto-reply decisions
KNOWN_CONTACTS = {
    "vip": [],       # Always escalate immediately
    "trusted": [],   # Can auto-reply with acknowledgment
    "unknown": [],   # Hold for review
}


class InboxTriageAgent(BaseAgent):
    """Monitors and triages incoming messages across all channels."""

    def __init__(self, poll_interval: int = 30):
        super().__init__(
            name="inbox_triage",
            description="Monitors Gmail, WhatsApp, Telegram - categorizes and routes messages",
            poll_interval=poll_interval,
        )
        self.processed_ids: set = set()

    async def tick(self):
        """Check for new messages across all input sources."""
        # Check Vault/Needs_Action for new items from watchers
        new_tasks = self.read_vault_folder("Needs_Action", limit=10)

        for task in new_tasks:
            if task["id"] in self.processed_ids:
                continue

            self.processed_ids.add(task["id"])
            result = self._triage_task(task)

            if result["priority"] in ("urgent", "high"):
                await self.notify_telegram(
                    f"*{result['priority'].upper()}:* {result['title']}\n\n"
                    f"Source: {result['source']}\n"
                    f"Action: {result['suggested_action']}",
                    priority=result["priority"],
                )

            logger.info(
                f"[inbox_triage] Triaged: {task['id']} -> "
                f"priority={result['priority']}, action={result['suggested_action']}"
            )

    def _triage_task(self, task: dict) -> dict:
        """Analyze a task and determine priority and routing."""
        content = task.get("content", "").lower()
        task_id = task["id"]

        # Detect source
        source = "unknown"
        if "gmail" in task_id.lower() or "email" in content:
            source = "gmail"
        elif "whatsapp" in task_id.lower() or "whatsapp" in content:
            source = "whatsapp"
        elif "linkedin" in task_id.lower():
            source = "linkedin"
        elif "telegram" in task_id.lower():
            source = "telegram"
        elif "filesystem" in task_id.lower() or "file" in content[:50]:
            source = "filesystem"

        # Detect priority
        priority = "medium"
        if any(kw in content for kw in URGENT_KEYWORDS):
            priority = "urgent"
        elif any(kw in content for kw in HIGH_KEYWORDS):
            priority = "high"
        elif any(kw in content for kw in LOW_KEYWORDS):
            priority = "low"

        # Extract title
        title = task_id.replace("_", " ")
        for line in task.get("content", "").split("\n"):
            line = line.strip()
            if line.startswith("## ") or line.startswith("# "):
                title = line.lstrip("# ").strip()
                break

        # Determine suggested action
        if priority == "urgent":
            action = "escalate_immediately"
        elif priority == "high":
            action = "review_today"
        elif source in ("gmail", "whatsapp") and priority == "medium":
            action = "auto_acknowledge"
        elif priority == "low":
            action = "batch_process"
        else:
            action = "review_when_available"

        return {
            "task_id": task_id,
            "title": title[:80],
            "source": source,
            "priority": priority,
            "suggested_action": action,
            "keywords_found": [kw for kw in URGENT_KEYWORDS + HIGH_KEYWORDS if kw in content],
        }

    async def handle_message(self, message: AgentMessage) -> Optional[AgentMessage]:
        """Handle messages from other agents."""
        if "triage" in message.content.lower():
            # Re-triage a specific item
            return AgentMessage(
                sender=self.name,
                recipient=message.sender,
                content=f"Re-triaged as requested",
            )
        return None
