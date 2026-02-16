"""
Task Orchestrator Agent

The central coordinator that routes tasks to appropriate agents,
tracks SLAs, sends reminders, and manages the approval pipeline.
"""

import logging
import shutil
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional

from .base import BaseAgent, AgentMessage, AgentStatus, VAULT_PATH

logger = logging.getLogger(__name__)


class TaskOrchestratorAgent(BaseAgent):
    """Central task coordinator and router."""

    def __init__(self, poll_interval: int = 30):
        super().__init__(
            name="task_orchestrator",
            description="Routes tasks, tracks SLAs, sends reminders, manages approvals",
            poll_interval=poll_interval,
        )
        self.agents: Dict[str, BaseAgent] = {}
        self.sla_warnings_sent: set = set()

    def register_agent(self, agent: BaseAgent):
        """Register a sub-agent with the orchestrator."""
        self.agents[agent.name] = agent
        logger.info(f"[orchestrator] Registered agent: {agent.name}")

    async def tick(self):
        """Main orchestration loop."""
        # 1. Check for stale tasks (SLA monitoring)
        await self._check_sla()

        # 2. Route new tasks to appropriate agents
        await self._route_new_tasks()

        # 3. Check approved tasks and execute actions
        await self._process_approved()

        # 4. Generate periodic summaries
        await self._check_digest_schedule()

    async def _check_sla(self):
        """Check for tasks that have been pending too long."""
        needs_action = VAULT_PATH / "Needs_Action"
        if not needs_action.exists():
            return

        now = datetime.now()
        for f in needs_action.glob("*.md"):
            if f.stem in self.sla_warnings_sent:
                continue

            age_hours = (now.timestamp() - f.stat().st_mtime) / 3600

            if age_hours > 24:
                self.sla_warnings_sent.add(f.stem)
                await self.notify_telegram(
                    f"SLA Warning: Task *{f.stem}* has been pending for "
                    f"{int(age_hours)} hours. Please review.",
                    priority="high",
                )
                self._audit("sla_warning", {
                    "task_id": f.stem,
                    "age_hours": int(age_hours),
                })

    async def _route_new_tasks(self):
        """Route tasks to the appropriate agent based on content."""
        needs_action = VAULT_PATH / "Needs_Action"
        if not needs_action.exists():
            return

        for f in needs_action.glob("*.md"):
            try:
                content = f.read_text(encoding="utf-8", errors="replace").lower()

                # Determine which agent should handle this
                target_agent = None
                if any(kw in content for kw in ["email", "gmail", "inbox"]):
                    target_agent = "inbox_triage"
                elif any(kw in content for kw in ["linkedin", "post", "social"]):
                    target_agent = "social_media"
                elif any(kw in content for kw in ["invoice", "expense", "payment", "odoo"]):
                    target_agent = "financial"
                elif any(kw in content for kw in ["meeting", "calendar", "schedule"]):
                    target_agent = "calendar"

                if target_agent and target_agent in self.agents:
                    msg = AgentMessage(
                        sender=self.name,
                        recipient=target_agent,
                        content=f"Process task: {f.stem}",
                        metadata={"task_id": f.stem, "path": str(f)},
                    )
                    await self.agents[target_agent].handle_message(msg)
            except Exception as e:
                logger.warning(f"[orchestrator] Error routing {f.stem}: {e}")

    async def _process_approved(self):
        """Execute actions for approved tasks."""
        approved = VAULT_PATH / "Approved"
        if not approved.exists():
            return

        for f in approved.glob("*.md"):
            try:
                content = f.read_text(encoding="utf-8", errors="replace")
                logger.info(f"[orchestrator] Processing approved task: {f.stem}")

                # Move to Done
                done_dir = VAULT_PATH / "Done"
                done_dir.mkdir(parents=True, exist_ok=True)
                dest = done_dir / f.name
                shutil.move(str(f), str(dest))

                self._stats["actions_taken"] += 1
                self._audit("task_completed", {"task_id": f.stem})

            except Exception as e:
                logger.error(f"[orchestrator] Error processing {f.stem}: {e}")

    async def _check_digest_schedule(self):
        """Send daily digest at configured time."""
        now = datetime.now()
        # Send digest at 8 PM if not already sent today
        if now.hour == 20 and now.minute < 2:
            digest_marker = VAULT_PATH / "Logs" / f"digest_sent_{now.strftime('%Y-%m-%d')}"
            if not digest_marker.exists():
                await self._send_daily_digest()
                digest_marker.parent.mkdir(parents=True, exist_ok=True)
                digest_marker.write_text(now.isoformat())

    async def _send_daily_digest(self):
        """Generate and send the daily digest."""
        pending = len(list((VAULT_PATH / "Needs_Action").glob("*.md"))) if (VAULT_PATH / "Needs_Action").exists() else 0
        done_today = 0
        done_dir = VAULT_PATH / "Done"
        if done_dir.exists():
            today = datetime.now().strftime("%Y-%m-%d")
            done_today = sum(1 for f in done_dir.glob("*.md") if today in f.name)

        agent_stats = []
        for name, agent in self.agents.items():
            s = agent.stats
            agent_stats.append(f"  - {name}: {s.get('actions_taken', 0)} actions, {s.get('status', 'unknown')}")

        summary = (
            f"Tasks completed today: {done_today}\n"
            f"Pending items: {pending}\n\n"
            f"Agent Performance:\n" + "\n".join(agent_stats)
        )

        await self.notify_telegram(summary, priority="low")
        self._audit("digest_sent", {"done_today": done_today, "pending": pending})

    def get_system_status(self) -> dict:
        """Get comprehensive system status."""
        agent_statuses = {}
        for name, agent in self.agents.items():
            agent_statuses[name] = agent.stats

        return {
            "orchestrator": self.stats,
            "agents": agent_statuses,
            "vault": {
                "needs_action": len(list((VAULT_PATH / "Needs_Action").glob("*.md"))) if (VAULT_PATH / "Needs_Action").exists() else 0,
                "in_progress": len(list((VAULT_PATH / "In_Progress").glob("**/*.md"))) if (VAULT_PATH / "In_Progress").exists() else 0,
                "pending_approval": len(list((VAULT_PATH / "Pending_Approval").glob("*.md"))) if (VAULT_PATH / "Pending_Approval").exists() else 0,
                "done_today": sum(1 for f in (VAULT_PATH / "Done").glob("*.md") if datetime.now().strftime("%Y-%m-%d") in f.name) if (VAULT_PATH / "Done").exists() else 0,
            },
            "timestamp": datetime.now().isoformat(),
        }

    async def handle_message(self, message: AgentMessage) -> Optional[AgentMessage]:
        """Handle inter-agent communication."""
        if "status" in message.content.lower():
            status = self.get_system_status()
            return AgentMessage(
                sender=self.name,
                recipient=message.sender,
                content=f"System status: {status}",
            )
        return None
