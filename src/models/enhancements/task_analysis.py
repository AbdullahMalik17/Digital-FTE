"""
Data models for task analysis and agentic intelligence.
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional


class TaskDomain(Enum):
    """Task category classification."""
    EMAIL = "email"
    CALENDAR = "calendar"
    SOCIAL_MEDIA = "social"
    FILE_MANAGEMENT = "file"
    CODE = "code"
    AUTOMATION = "automation"
    RESEARCH = "research"
    MOBILE_CONTROL = "mobile"
    DESKTOP_CONTROL = "desktop"
    MUSIC = "music"
    PAYMENT = "payment"
    ERP = "erp"
    GENERAL = "general"


class ApproachDecision(Enum):
    """What should the agent do?"""
    EXECUTE_DIRECTLY = "direct"      # Simple, safe → Just do it
    SPEC_DRIVEN = "spec"             # Complex, risky → Plan first
    CLARIFICATION_NEEDED = "clarify" # Ambiguous → Ask user
    PROACTIVE_SUGGEST = "suggest"    # Anticipate → Offer to help


@dataclass
class TaskAnalysisResult:
    """Result of task analysis."""
    intent: str  # What user wants in one sentence
    domain: TaskDomain
    entities: Dict[str, Any]  # Extracted: recipients, dates, amounts, etc.
    constraints: List[str]  # Must-haves and limitations
    required_resources: List[str]  # APIs, files, credentials needed
    ambiguities: List[str]  # Unclear parts needing clarification
    similar_past_tasks: List[str] = field(default_factory=list)  # IDs of similar tasks
    confidence: float = 0.8  # 0-1 confidence in this analysis
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class ComplexityScore:
    """Complexity assessment."""
    overall_score: float  # 0-1 (simple to complex)
    factors: Dict[str, float]  # Individual factor scores
    reasoning: List[str]  # Why this score?
    estimated_steps: int  # How many steps?
    estimated_time: str  # Human-readable estimate
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class RiskScore:
    """Risk assessment."""
    overall_score: float  # 0-1 (safe to dangerous)
    factors: Dict[str, float]  # Individual risk factors
    reasoning: List[str]  # Why risky?
    reversible: bool  # Can it be undone?
    requires_approval: bool  # Per company handbook
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class AgenticDecision:
    """Final decision on how to handle task."""
    approach: ApproachDecision
    confidence: float  # 0-1, how confident in this decision
    reasoning: List[str]  # Why this approach?
    complexity: ComplexityScore
    risk: RiskScore
    recommended_next_steps: List[str]
    approval_required: bool
    estimated_duration: str
    timestamp: datetime = field(default_factory=datetime.now)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for logging/storage."""
        return {
            "approach": self.approach.value,
            "confidence": self.confidence,
            "reasoning": self.reasoning,
            "complexity_score": self.complexity.overall_score,
            "risk_score": self.risk.overall_score,
            "estimated_steps": self.complexity.estimated_steps,
            "estimated_duration": self.estimated_duration,
            "approval_required": self.approval_required,
            "recommended_next_steps": self.recommended_next_steps,
            "timestamp": self.timestamp.isoformat()
        }


@dataclass
class Pattern:
    """Detected pattern for proactive suggestions."""
    type: str  # Pattern type (e.g., "missing_focus_music")
    confidence: float  # 0-1 confidence
    action: str  # Recommended action
    context: Dict[str, Any] = field(default_factory=dict)
    priority: str = "medium"  # low, medium, high
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class ProactiveSuggestion:
    """Proactive action suggestion."""
    title: str
    description: str
    action: str  # What to do
    priority: str  # low, medium, high
    action_id: str  # Unique identifier
    context: Dict[str, Any] = field(default_factory=dict)
    confidence: float = 0.7
    safe_to_auto_execute: bool = False
    timestamp: datetime = field(default_factory=datetime.now)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for notifications."""
        return {
            "title": self.title,
            "description": self.description,
            "action": self.action,
            "priority": self.priority,
            "action_id": self.action_id,
            "context": self.context,
            "timestamp": self.timestamp.isoformat()
        }
