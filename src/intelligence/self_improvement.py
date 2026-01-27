"""
Self-Improvement Loop - Agent learns and improves over time.
Analyzes performance, identifies patterns, and suggests improvements.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
import statistics


class MetricType(Enum):
    """Types of metrics to track."""
    SUCCESS_RATE = "success_rate"
    RESPONSE_TIME = "response_time"
    USER_SATISFACTION = "user_satisfaction"
    TASK_COMPLEXITY = "task_complexity"
    ACCURACY = "accuracy"
    EFFICIENCY = "efficiency"


class ImprovementCategory(Enum):
    """Categories of improvements."""
    PERFORMANCE = "performance"
    ACCURACY = "accuracy"
    USER_EXPERIENCE = "user_experience"
    INTEGRATION = "integration"
    WORKFLOW = "workflow"
    LEARNING = "learning"


@dataclass
class PerformanceMetric:
    """A performance metric data point."""
    type: MetricType
    value: float
    timestamp: datetime
    context: Dict[str, Any]


@dataclass
class ImprovementSuggestion:
    """A suggested improvement."""
    id: str
    category: ImprovementCategory
    title: str
    description: str
    rationale: List[str]
    confidence: float
    priority: int  # 1 (high) to 5 (low)
    estimated_impact: str
    implementation_complexity: str  # low, medium, high
    created_at: datetime

    def to_dict(self) -> Dict:
        """Convert to dictionary."""
        return {
            'id': self.id,
            'category': self.category.value,
            'title': self.title,
            'description': self.description,
            'rationale': self.rationale,
            'confidence': self.confidence,
            'priority': self.priority,
            'estimated_impact': self.estimated_impact,
            'implementation_complexity': self.implementation_complexity,
            'created_at': self.created_at.isoformat()
        }


@dataclass
class WeeklyReport:
    """Weekly performance report."""
    week_start: datetime
    week_end: datetime
    metrics: Dict[str, Any]
    patterns: List[str]
    improvements: List[ImprovementSuggestion]
    success_stories: List[str]
    failures: List[str]
    recommendations: List[str]

    def to_dict(self) -> Dict:
        """Convert to dictionary."""
        return {
            'week_start': self.week_start.strftime('%Y-%m-%d'),
            'week_end': self.week_end.strftime('%Y-%m-%d'),
            'metrics': self.metrics,
            'patterns': self.patterns,
            'improvements': [i.to_dict() for i in self.improvements],
            'success_stories': self.success_stories,
            'failures': self.failures,
            'recommendations': self.recommendations
        }


class SelfImprovementLoop:
    """
    Self-improvement system for the agent.

    Features:
    - Track performance metrics
    - Identify patterns in successes/failures
    - Generate improvement suggestions
    - Learn from user feedback
    - Create weekly performance reports
    - Auto-implement safe improvements
    """

    def __init__(
        self,
        learning_db=None,
        auto_improve: bool = False
    ):
        """
        Initialize self-improvement loop.
        
        Args:
            learning_db: Database for learning history
            auto_improve: Whether to auto-implement safe improvements
        """
        if learning_db is None:
            from src.storage.json_db import JsonDB
            self.learning_db = JsonDB("learning_history")
        else:
            self.learning_db = learning_db
            
        self.auto_improve = auto_improve

        # Metrics history
        self.metrics_history: List[PerformanceMetric] = []
        self._load_history()

        # Improvement suggestions
        self.suggestions: List[ImprovementSuggestion] = []
        self.implemented_improvements: List[str] = []

    def _load_history(self):
        """Load history from database."""
        if not self.learning_db:
            return
            
        stored_metrics = self.learning_db.get("metrics", [])
        for m_data in stored_metrics:
            try:
                metric = PerformanceMetric(
                    type=MetricType(m_data['type']),
                    value=m_data['value'],
                    timestamp=datetime.fromisoformat(m_data['timestamp']),
                    context=m_data.get('context', {})
                )
                self.metrics_history.append(metric)
            except Exception as e:
                print(f"[SelfImprovement] Error loading metric: {e}")

    def record_metric(
        self,
        type: MetricType,
        value: float,
        context: Dict = None
    ):
        """
        Record a performance metric.
        
        Args:
            type: Type of metric
            value: Metric value
            context: Additional context
        """
        metric = PerformanceMetric(
            type=type,
            value=value,
            timestamp=datetime.now(),
            context=context or {}
        )

        self.metrics_history.append(metric)

        # Store in learning database
        self._store_metric(metric)

    # ... [Skipping middle methods] ...

    def _store_metric(self, metric: PerformanceMetric):
        """Store metric in database."""
        if self.learning_db:
             # Convert to dict for storage
            metric_data = {
                'type': metric.type.value,
                'value': metric.value,
                'timestamp': metric.timestamp.isoformat(),
                'context': metric.context
            }
            self.learning_db.upsert_item_in_list("metrics", metric_data, id_key='timestamp')
    
    def record_approval(self, action_type: str, approved: bool, context: Dict = None):
         """Record user approval decision for learning."""
         if self.learning_db:
             approval_data = {
                 'action_type': action_type,
                 'approved': approved,
                 'context': context or {},
                 'timestamp': datetime.now().isoformat()
             }
             self.learning_db.upsert_item_in_list("approvals", approval_data, id_key='timestamp')
