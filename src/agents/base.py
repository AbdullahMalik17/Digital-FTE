"""
Base Agent class for all Abdullah Junior agents.

Each agent follows a perception -> reasoning -> action loop:
1. Perceive: Read from input sources (Vault folders, APIs, webhooks)
2. Reason: Analyze and decide what action to take
3. Act: Execute the action (create task, send notification, call API)
4. Log: Record what was done in the audit trail
"""

import asyncio
import json
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).parent.parent.parent
VAULT_PATH = PROJECT_ROOT / "Vault"
AUDIT_PATH = VAULT_PATH / "Logs" / "audit"


class AgentStatus(Enum):
    IDLE = "idle"
    RUNNING = "running"
    PAUSED = "paused"
    ERROR = "error"
    STOPPED = "stopped"


@dataclass
class AgentMessage:
    """Message passed between agents or to the notification system."""
    sender: str
    recipient: str  # agent name or "user" or "telegram"
    content: str
    priority: str = "medium"  # low, medium, high, urgent
    action_required: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())


class BaseAgent(ABC):
    """Abstract base class for all agents."""

    def __init__(self, name: str, description: str, poll_interval: int = 60):
        self.name = name
        self.description = description
        self.poll_interval = poll_interval
        self.status = AgentStatus.IDLE
        self._running = False
        self._stats = {
            "started_at": None,
            "actions_taken": 0,
            "errors": 0,
            "last_run": None,
        }
        self._message_queue: List[AgentMessage] = []
        self._telegram_bot = None

    @property
    def stats(self) -> Dict[str, Any]:
        return {**self._stats, "status": self.status.value}

    # ── Lifecycle ────────────────────────────────────────

    async def start(self):
        """Start the agent's main loop."""
        self._running = True
        self.status = AgentStatus.RUNNING
        self._stats["started_at"] = datetime.now().isoformat()
        logger.info(f"[{self.name}] Started")
        self._audit("agent_started", {"description": self.description})

        try:
            while self._running:
                try:
                    await self.tick()
                    self._stats["last_run"] = datetime.now().isoformat()
                except Exception as e:
                    self._stats["errors"] += 1
                    logger.error(f"[{self.name}] Error in tick: {e}")
                    self._audit("agent_error", {"error": str(e)})

                await asyncio.sleep(self.poll_interval)
        finally:
            self.status = AgentStatus.STOPPED
            logger.info(f"[{self.name}] Stopped")

    def stop(self):
        """Signal the agent to stop."""
        self._running = False
        self.status = AgentStatus.STOPPED
        self._audit("agent_stopped", {})

    # ── Core loop (implement in subclasses) ──────────────

    @abstractmethod
    async def tick(self):
        """Single iteration of the agent's perception-reasoning-action loop."""
        pass

    @abstractmethod
    async def handle_message(self, message: AgentMessage) -> Optional[AgentMessage]:
        """Handle an incoming message from another agent or the user."""
        pass

    # ── Vault helpers ────────────────────────────────────

    def create_task(
        self,
        title: str,
        content: str,
        priority: str = "medium",
        source: str = None,
        folder: str = "Needs_Action",
    ) -> str:
        """Create a task file in the Vault."""
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        task_id = f"Task_{self.name}_{timestamp}"
        folder_path = VAULT_PATH / folder
        folder_path.mkdir(parents=True, exist_ok=True)
        task_file = folder_path / f"{task_id}.md"

        task_content = f"""---
type: {source or self.name}
priority: {priority}
created: {datetime.now().isoformat()}
source: {self.name}
status: pending
---

## {title}

{content}

## Actions
- [ ] Review and process
"""
        task_file.write_text(task_content, encoding="utf-8")
        self._stats["actions_taken"] += 1
        self._audit("task_created", {"task_id": task_id, "title": title, "priority": priority})
        return task_id

    def read_vault_folder(self, folder: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Read tasks from a Vault folder."""
        folder_path = VAULT_PATH / folder
        if not folder_path.exists():
            return []

        tasks = []
        for f in sorted(folder_path.glob("*.md"), key=lambda x: x.stat().st_mtime, reverse=True)[:limit]:
            try:
                content = f.read_text(encoding="utf-8", errors="replace")
                tasks.append({
                    "id": f.stem,
                    "filename": f.name,
                    "content": content,
                    "modified": datetime.fromtimestamp(f.stat().st_mtime).isoformat(),
                })
            except Exception:
                pass
        return tasks

    # ── Notification helpers ─────────────────────────────

    async def notify_telegram(self, message: str, priority: str = "medium"):
        """Send a notification via Telegram. Silently skips if not configured."""
        if self._telegram_bot is None:
            try:
                from notifications.telegram_bot import TelegramBot
                self._telegram_bot = TelegramBot()
            except ImportError:
                try:
                    from src.notifications.telegram_bot import TelegramBot
                    self._telegram_bot = TelegramBot()
                except ImportError:
                    logger.debug(f"[{self.name}] Telegram bot not available, skipping notification")
                    return

        # Skip if bot wasn't initialized (no token)
        if not getattr(self._telegram_bot, 'token', None):
            logger.debug(f"[{self.name}] No Telegram token configured, skipping notification")
            return

        try:
            await self._telegram_bot.send_alert(
                title=f"[{self.name}]",
                message=message,
                level="warning" if priority in ("high", "urgent") else "info",
            )
        except Exception as e:
            logger.debug(f"[{self.name}] Telegram notification failed: {e}")

    def send_message(self, recipient: str, content: str, **kwargs) -> AgentMessage:
        """Send a message to another agent or the user."""
        msg = AgentMessage(
            sender=self.name,
            recipient=recipient,
            content=content,
            **kwargs,
        )
        self._message_queue.append(msg)
        return msg

    # ── Audit trail ──────────────────────────────────────

    def _audit(self, action: str, details: Dict[str, Any]):
        """Write to the audit log."""
        AUDIT_PATH.mkdir(parents=True, exist_ok=True)
        today = datetime.now().strftime("%Y-%m-%d")
        audit_file = AUDIT_PATH / f"audit_{today}.jsonl"

        entry = {
            "timestamp": datetime.now().isoformat(),
            "agent": self.name,
            "action": action,
            "details": details,
            "status": "completed",
        }

        try:
            with open(audit_file, "a", encoding="utf-8") as f:
                f.write(json.dumps(entry) + "\n")
        except Exception as e:
            logger.error(f"[{self.name}] Failed to write audit: {e}")
