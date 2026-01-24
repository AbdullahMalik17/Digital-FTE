"""
Context Monitor - Proactive suggestion system with Mobile Notifications.

Monitors various contexts and suggests actions before user asks.
Integrated with Push Notification service to send alerts to phone.
"""

import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
from pathlib import Path

from src.intelligence.agentic_intelligence import AgenticIntelligence
from src.models.enhancements.task_analysis import ApproachDecision

# Import push notification service
try:
    from src.notifications import get_push_service, NotificationPayload
    HAS_PUSH = True
except ImportError:
    HAS_PUSH = False
    print("[ContextMonitor] Push notifications not available")


class ContextType(Enum):
    """Types of contexts to monitor."""
    EMAIL = "email"
    CALENDAR = "calendar"
    NOTIFICATION = "notification"
    ACTIVITY = "activity"
    TIME_BASED = "time_based"
    PATTERN = "pattern"


@dataclass
class ContextSignal:
    """A signal detected from monitoring context."""
    type: ContextType
    trigger: str
    confidence: float
    metadata: Dict[str, Any]
    timestamp: datetime


@dataclass
class ProactiveSuggestion:
    """A suggested action for the user."""
    id: str
    title: str
    description: str
    suggested_action: str
    reasoning: List[str]
    confidence: float
    priority: int  # 1 (high) to 5 (low)
    context_signals: List[ContextSignal]
    timestamp: datetime

    def to_dict(self) -> Dict:
        """Convert to dictionary for storage/display."""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'suggested_action': self.suggested_action,
            'reasoning': self.reasoning,
            'confidence': self.confidence,
            'priority': self.priority,
            'timestamp': self.timestamp.isoformat()
        }


class ContextMonitor:
    """
    Monitor context and generate proactive suggestions.

    This is the "invisible assistant" that works in the background.
    """

    # Suggestion thresholds
    SUGGESTION_THRESHOLD = 0.75  # Confidence needed to suggest
    HIGH_PRIORITY_THRESHOLD = 0.90  # Confidence for high priority

    def __init__(
        self,
        intelligence: AgenticIntelligence,
        learning_db=None,
        monitoring_interval: int = 300,  # 5 minutes
        enable_push_notifications: bool = True
    ):
        """
        Initialize context monitor.

        Args:
            intelligence: Agentic intelligence for decision making
            learning_db: Database for learning patterns
            monitoring_interval: How often to check context (seconds)
            enable_push_notifications: Whether to send push notifications
        """
        self.intelligence = intelligence
        self.learning_db = learning_db
        self.monitoring_interval = monitoring_interval
        self.enable_push = enable_push_notifications and HAS_PUSH

        # Push notification service
        self.push_service = get_push_service() if self.enable_push else None

        # Active monitors (can be enabled/disabled per context type)
        self.active_monitors = {
            ContextType.EMAIL: True,
            ContextType.CALENDAR: True,
            ContextType.NOTIFICATION: True,
            ContextType.ACTIVITY: True,
            ContextType.TIME_BASED: True,
            ContextType.PATTERN: True,
        }

        # Recent suggestions (to avoid duplicates)
        self.recent_suggestions: List[ProactiveSuggestion] = []
        self.suggestion_history: List[Dict] = []

        # Running flag
        self.is_running = False

        # Daily digest tracking
        self.last_digest_date: Optional[datetime] = None

        print(f"[ContextMonitor] Push notifications: {'enabled' if self.enable_push else 'disabled'}")

    async def start(self):
        """Start monitoring context in background."""
        self.is_running = True
        print(f"[Context Monitor] Started - checking every {self.monitoring_interval}s")

        while self.is_running:
            try:
                # Run monitoring cycle
                await self._monitoring_cycle()

                # Wait for next cycle
                await asyncio.sleep(self.monitoring_interval)

            except Exception as e:
                print(f"[Context Monitor] Error in monitoring cycle: {e}")
                await asyncio.sleep(self.monitoring_interval)

    def stop(self):
        """Stop monitoring."""
        self.is_running = False
        print("[Context Monitor] Stopped")

    async def _monitoring_cycle(self):
        """Run one monitoring cycle - check all contexts."""
        print(f"\n[Context Monitor] Running cycle at {datetime.now().strftime('%H:%M:%S')}")

        # Collect signals from all active monitors
        signals: List[ContextSignal] = []

        if self.active_monitors[ContextType.EMAIL]:
            signals.extend(await self._monitor_email())

        if self.active_monitors[ContextType.CALENDAR]:
            signals.extend(await self._monitor_calendar())

        if self.active_monitors[ContextType.NOTIFICATION]:
            signals.extend(await self._monitor_notifications())

        if self.active_monitors[ContextType.ACTIVITY]:
            signals.extend(await self._monitor_activity())

        if self.active_monitors[ContextType.TIME_BASED]:
            signals.extend(await self._monitor_time_based())

        if self.active_monitors[ContextType.PATTERN]:
            signals.extend(await self._monitor_patterns())

        # Generate suggestions from signals
        if signals:
            print(f"[Context Monitor] Found {len(signals)} signals")
            suggestions = await self._generate_suggestions(signals)

            if suggestions:
                print(f"[Context Monitor] Generated {len(suggestions)} suggestions")
                for suggestion in suggestions:
                    await self._present_suggestion(suggestion)
        else:
            print("[Context Monitor] No signals detected")

    async def _monitor_email(self) -> List[ContextSignal]:
        """
        Monitor email context.

        Looks for:
        - Unread urgent emails
        - Emails requiring response
        - Follow-up opportunities
        """
        signals = []

        # TODO: Integrate with actual email API
        # For now, this is a placeholder showing the logic

        # Example signals (would come from real email checking):
        # - Unread email from important contact
        # - Email thread with no reply in 24h
        # - Meeting invitation without response

        return signals

    async def _monitor_calendar(self) -> List[ContextSignal]:
        """
        Monitor calendar context.

        Looks for:
        - Upcoming meetings (preparation time)
        - Scheduling conflicts
        - Follow-up opportunities after meetings
        """
        signals = []

        # TODO: Integrate with calendar API
        # Example signals:
        # - Meeting in 15 minutes without agenda
        # - Back-to-back meetings (suggest break)
        # - Meeting ended 1h ago (suggest follow-up)

        return signals

    async def _monitor_notifications(self) -> List[ContextSignal]:
        """
        Monitor system/app notifications.

        Looks for:
        - Important notifications
        - Actionable notifications
        - Patterns in notification behavior
        """
        signals = []

        # TODO: Integrate with notification system
        # Example signals:
        # - LinkedIn post got high engagement (suggest follow-up)
        # - Slack message from CEO (high priority)
        # - Payment due notification

        return signals

    async def _monitor_activity(self) -> List[ContextSignal]:
        """
        Monitor user activity patterns.

        Looks for:
        - Work/break patterns
        - Focus time vs meeting time
        - Energy levels (inferred from activity)
        """
        signals = []

        # TODO: Track activity patterns
        # Example signals:
        # - 2h of coding (suggest break)
        # - Deep work period ending (suggest task completion)
        # - Low activity period (suggest task review)

        return signals

    async def _monitor_time_based(self) -> List[ContextSignal]:
        """
        Monitor time-based triggers.

        Looks for:
        - Daily routines (morning/evening)
        - Weekly patterns (Friday afternoon)
        - Deadlines approaching
        """
        signals = []

        now = datetime.now()
        hour = now.hour
        day = now.weekday()  # Monday = 0

        # Morning routine (9am)
        if hour == 9 and now.minute < 10:
            signals.append(ContextSignal(
                type=ContextType.TIME_BASED,
                trigger="morning_routine",
                confidence=0.9,
                metadata={
                    "time": "9am",
                    "suggested_actions": [
                        "Review today's calendar",
                        "Check priority emails",
                        "Plan daily goals"
                    ]
                },
                timestamp=now
            ))

        # Evening routine (5pm)
        if hour == 17 and now.minute < 10:
            signals.append(ContextSignal(
                type=ContextType.TIME_BASED,
                trigger="evening_routine",
                confidence=0.9,
                metadata={
                    "time": "5pm",
                    "suggested_actions": [
                        "Review completed tasks",
                        "Schedule tomorrow's priorities",
                        "Send pending follow-ups"
                    ]
                },
                timestamp=now
            ))

        # Friday afternoon (wrap-up week)
        if day == 4 and hour >= 15:  # Friday after 3pm
            signals.append(ContextSignal(
                type=ContextType.TIME_BASED,
                trigger="friday_wrap_up",
                confidence=0.85,
                metadata={
                    "day": "Friday",
                    "suggested_actions": [
                        "Review week's accomplishments",
                        "Close open tasks",
                        "Plan next week"
                    ]
                },
                timestamp=now
            ))

        return signals

    async def _monitor_patterns(self) -> List[ContextSignal]:
        """
        Monitor learned patterns from history.

        Looks for:
        - Recurring task patterns
        - Context similarities with past successful actions
        - User preference patterns
        """
        signals = []

        if not self.learning_db:
            return signals

        # TODO: Analyze learned patterns
        # Example signals:
        # - Usually sends report at this time
        # - Often schedules team meeting on Mondays
        # - Typical post-meeting workflow

        return signals

    async def _generate_suggestions(
        self,
        signals: List[ContextSignal]
    ) -> List[ProactiveSuggestion]:
        """
        Generate proactive suggestions from context signals.

        Args:
            signals: List of detected context signals

        Returns:
            List of suggestions that meet confidence threshold
        """
        suggestions = []

        # Group signals by type and trigger
        signal_groups = self._group_signals(signals)

        for group_key, group_signals in signal_groups.items():
            # Calculate combined confidence
            avg_confidence = sum(s.confidence for s in group_signals) / len(group_signals)

            # Only suggest if confidence is high enough
            if avg_confidence < self.SUGGESTION_THRESHOLD:
                continue

            # Build suggestion from signal group
            suggestion = await self._build_suggestion(group_signals, avg_confidence)

            if suggestion:
                # Check if this is a duplicate of recent suggestion
                if not self._is_duplicate(suggestion):
                    suggestions.append(suggestion)

        return suggestions

    def _group_signals(
        self,
        signals: List[ContextSignal]
    ) -> Dict[str, List[ContextSignal]]:
        """Group related signals together."""
        groups: Dict[str, List[ContextSignal]] = {}

        for signal in signals:
            key = f"{signal.type.value}_{signal.trigger}"
            if key not in groups:
                groups[key] = []
            groups[key].append(signal)

        return groups

    async def _build_suggestion(
        self,
        signals: List[ContextSignal],
        confidence: float
    ) -> Optional[ProactiveSuggestion]:
        """Build a suggestion from grouped signals."""
        if not signals:
            return None

        # Use first signal as primary
        primary = signals[0]

        # Determine priority (1 = highest, 5 = lowest)
        if confidence >= self.HIGH_PRIORITY_THRESHOLD:
            priority = 1
        elif confidence >= 0.85:
            priority = 2
        elif confidence >= 0.80:
            priority = 3
        else:
            priority = 4

        # Build suggestion based on signal type
        suggestion_id = f"{primary.type.value}_{primary.trigger}_{primary.timestamp.timestamp()}"

        if primary.type == ContextType.TIME_BASED:
            # Time-based suggestions (daily routines)
            actions = primary.metadata.get('suggested_actions', [])

            suggestion = ProactiveSuggestion(
                id=suggestion_id,
                title=f"{primary.trigger.replace('_', ' ').title()}",
                description=f"It's {primary.metadata.get('time', 'time')} - suggested routine",
                suggested_action="\n".join(f"- {action}" for action in actions),
                reasoning=[
                    f"Detected {primary.trigger} pattern",
                    f"Confidence: {confidence:.1%}",
                    f"Based on time-based triggers"
                ],
                confidence=confidence,
                priority=priority,
                context_signals=signals,
                timestamp=datetime.now()
            )

            return suggestion

        # Add more signal type handlers here
        return None

    def _is_duplicate(self, suggestion: ProactiveSuggestion) -> bool:
        """Check if this suggestion was recently made."""
        # Check last 1 hour of suggestions
        cutoff = datetime.now() - timedelta(hours=1)

        for recent in self.recent_suggestions:
            if recent.timestamp < cutoff:
                continue

            # Same title/action = duplicate
            if (
                recent.title == suggestion.title or
                recent.suggested_action == suggestion.suggested_action
            ):
                return True

        return False

    async def _present_suggestion(self, suggestion: ProactiveSuggestion):
        """
        Present suggestion to user via push notification and console.

        This method:
        - Sends push notification to phone
        - Logs to console
        - Stores in suggestion queue
        """
        print(f"\n[PROACTIVE SUGGESTION]")
        print(f"Priority: {suggestion.priority}/5")
        print(f"Title: {suggestion.title}")
        print(f"Description: {suggestion.description}")
        print(f"Confidence: {suggestion.confidence:.1%}")
        print(f"\nSuggested Actions:")
        print(suggestion.suggested_action)
        print(f"\nReasoning:")
        for reason in suggestion.reasoning:
            print(f"  - {reason}")

        # Send push notification to phone
        if self.enable_push and self.push_service:
            try:
                # Map priority (1-5) to notification priority
                priority_map = {
                    1: "urgent",
                    2: "high",
                    3: "normal",
                    4: "normal",
                    5: "low"
                }

                result = await self.push_service.send_proactive_suggestion(
                    title=suggestion.title,
                    description=suggestion.description,
                    action_id=suggestion.id,
                    priority=priority_map.get(suggestion.priority, "normal"),
                    context={
                        "confidence": suggestion.confidence,
                        "actions": suggestion.suggested_action,
                        "reasoning": suggestion.reasoning
                    }
                )

                if result.get("sent", 0) > 0:
                    print(f"[ContextMonitor] 📱 Push notification sent to {result['sent']} device(s)")
                else:
                    print(f"[ContextMonitor] No devices to notify: {result.get('reason', 'unknown')}")

            except Exception as e:
                print(f"[ContextMonitor] Failed to send push notification: {e}")

        # Store in recent suggestions
        self.recent_suggestions.append(suggestion)

        # Keep only last 20 suggestions in memory
        if len(self.recent_suggestions) > 20:
            self.recent_suggestions = self.recent_suggestions[-20:]

        # Save suggestion to file for persistence
        await self._save_suggestion_to_file(suggestion)

    async def record_feedback(
        self,
        suggestion_id: str,
        accepted: bool,
        user_note: str = None
    ):
        """
        Record user feedback on suggestion.

        Args:
            suggestion_id: Suggestion ID
            accepted: Whether user accepted the suggestion
            user_note: Optional note from user
        """
        feedback = {
            'suggestion_id': suggestion_id,
            'accepted': accepted,
            'user_note': user_note,
            'timestamp': datetime.now().isoformat()
        }

        self.suggestion_history.append(feedback)

        # Store in learning database
        if self.learning_db:
            # Find the suggestion
            suggestion = next(
                (s for s in self.recent_suggestions if s.id == suggestion_id),
                None
            )

            if suggestion:
                # Record approval pattern for learning
                context = {
                    'type': suggestion.context_signals[0].type.value if suggestion.context_signals else 'unknown',
                    'trigger': suggestion.context_signals[0].trigger if suggestion.context_signals else 'unknown',
                    'confidence': suggestion.confidence
                }

                self.learning_db.record_approval(
                    action_type='proactive_suggestion',
                    approved=accepted,
                    context=context
                )

    def get_suggestion_stats(self) -> Dict:
        """Get statistics on suggestions and acceptance."""
        total = len(self.suggestion_history)
        if total == 0:
            return {
                'total_suggestions': 0,
                'accepted': 0,
                'rejected': 0,
                'acceptance_rate': 0.0
            }

        accepted = sum(1 for s in self.suggestion_history if s['accepted'])

        return {
            'total_suggestions': total,
            'accepted': accepted,
            'rejected': total - accepted,
            'acceptance_rate': accepted / total
        }

    async def _save_suggestion_to_file(self, suggestion: ProactiveSuggestion):
        """Save suggestion to Vault for persistence."""
        try:
            import json

            vault_dir = Path("Vault/Suggestions")
            vault_dir.mkdir(parents=True, exist_ok=True)

            filename = vault_dir / f"suggestion_{suggestion.id[:20]}.json"

            with open(filename, "w") as f:
                json.dump(suggestion.to_dict(), f, indent=2)

        except Exception as e:
            print(f"[ContextMonitor] Failed to save suggestion: {e}")

    async def send_daily_digest(self):
        """
        Send daily morning digest notification.

        Called at 9am to give user a summary of:
        - Pending tasks
        - Urgent items
        - Proactive suggestions
        - Calendar overview
        """
        if not self.enable_push or not self.push_service:
            print("[ContextMonitor] Push not enabled for digest")
            return

        # Check if already sent today
        today = datetime.now().date()
        if self.last_digest_date == today:
            print("[ContextMonitor] Digest already sent today")
            return

        try:
            # Gather digest data
            pending_tasks = await self._count_pending_tasks()
            urgent_items = await self._count_urgent_items()
            suggestions = await self._get_top_suggestions()

            # Build summary
            summary_parts = []
            if urgent_items > 0:
                summary_parts.append(f"{urgent_items} urgent")
            if pending_tasks > 0:
                summary_parts.append(f"{pending_tasks} tasks pending")

            summary = " | ".join(summary_parts) if summary_parts else "All clear today!"

            # Send digest notification
            result = await self.push_service.send_daily_digest(
                summary=summary,
                task_count=pending_tasks,
                urgent_count=urgent_items,
                suggestions=[s.title for s in suggestions[:5]]
            )

            if result.get("sent", 0) > 0:
                print(f"[ContextMonitor] ☀️ Daily digest sent to {result['sent']} device(s)")
                self.last_digest_date = today
            else:
                print(f"[ContextMonitor] Digest not sent: {result.get('reason', 'no subscribers')}")

        except Exception as e:
            print(f"[ContextMonitor] Failed to send daily digest: {e}")

    async def _count_pending_tasks(self) -> int:
        """Count pending tasks in Vault."""
        try:
            needs_action = Path("Vault/Needs_Action")
            in_progress = Path("Vault/In_Progress")

            count = 0
            if needs_action.exists():
                count += len(list(needs_action.glob("*.md")))
            if in_progress.exists():
                count += len(list(in_progress.glob("**/*.md")))

            return count
        except Exception:
            return 0

    async def _count_urgent_items(self) -> int:
        """Count urgent items in Vault."""
        try:
            needs_action = Path("Vault/Needs_Action")
            urgent = 0

            if needs_action.exists():
                for file in needs_action.glob("*.md"):
                    content = file.read_text()
                    if "urgent" in content.lower() or "priority: high" in content.lower():
                        urgent += 1

            return urgent
        except Exception:
            return 0

    async def _get_top_suggestions(self) -> List[ProactiveSuggestion]:
        """Get top proactive suggestions."""
        # Return high-confidence recent suggestions
        return sorted(
            self.recent_suggestions,
            key=lambda s: (s.priority, -s.confidence)
        )[:5]

    async def send_approval_notification(
        self,
        task_id: str,
        task_title: str,
        task_description: str,
        risk_score: float,
        complexity_score: float
    ):
        """
        Send approval request notification for a task.

        Called when Agentic Intelligence determines a task
        needs user approval before execution.
        """
        if not self.enable_push or not self.push_service:
            print(f"[ContextMonitor] Approval needed: {task_title} (push disabled)")
            return

        try:
            result = await self.push_service.send_approval_request(
                task_id=task_id,
                task_title=task_title,
                task_description=task_description,
                risk_score=risk_score,
                complexity_score=complexity_score
            )

            if result.get("sent", 0) > 0:
                print(f"[ContextMonitor] 📱 Approval request sent for: {task_title}")
            else:
                print(f"[ContextMonitor] Approval not sent: {result.get('reason', 'unknown')}")

        except Exception as e:
            print(f"[ContextMonitor] Failed to send approval notification: {e}")

    async def notify_task_completed(
        self,
        task_id: str,
        task_title: str,
        result_summary: str
    ):
        """Notify user that a task was completed."""
        if not self.enable_push or not self.push_service:
            return

        try:
            await self.push_service.send_task_completed(
                task_id=task_id,
                task_title=task_title,
                result_summary=result_summary
            )
        except Exception as e:
            print(f"[ContextMonitor] Failed to send completion notification: {e}")