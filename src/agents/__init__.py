"""
Abdullah Junior - Agent Team

Specialized agents that work together as your AI Chief of Staff:
- InboxTriageAgent: Monitors Gmail, WhatsApp, Telegram - categorizes and routes
- SocialMediaAgent: Manages LinkedIn posting and engagement tracking
- TaskOrchestratorAgent: Routes tasks, tracks SLAs, sends reminders
- FinancialAgent: Monitors Odoo invoices/expenses, generates reports
- CalendarAgent: Detects meetings, manages scheduling, sends prep briefs
"""

from .base import BaseAgent, AgentStatus, AgentMessage
from .inbox_triage import InboxTriageAgent
from .social_media import SocialMediaAgent
from .task_orchestrator import TaskOrchestratorAgent

__all__ = [
    "BaseAgent",
    "AgentStatus",
    "AgentMessage",
    "InboxTriageAgent",
    "SocialMediaAgent",
    "TaskOrchestratorAgent",
]
