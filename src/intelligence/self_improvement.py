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
        self.learning_db = learning_db
        self.auto_improve = auto_improve

        # Metrics history
        self.metrics_history: List[PerformanceMetric] = []

        # Improvement suggestions
        self.suggestions: List[ImprovementSuggestion] = []
        self.implemented_improvements: List[str] = []

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
        if self.learning_db:
            self._store_metric(metric)

    async def analyze_performance(
        self,
        days: int = 7
    ) -> WeeklyReport:
        """
        Analyze recent performance and generate report.

        Args:
            days: Number of days to analyze

        Returns:
            WeeklyReport with analysis and suggestions
        """
        # Get metrics for time period
        cutoff = datetime.now() - timedelta(days=days)
        recent_metrics = [
            m for m in self.metrics_history
            if m.timestamp >= cutoff
        ]

        # Calculate aggregate metrics
        metrics = self._calculate_metrics(recent_metrics)

        # Identify patterns
        patterns = await self._identify_patterns(recent_metrics)

        # Generate improvement suggestions
        improvements = await self._generate_improvements(metrics, patterns)

        # Find success stories and failures
        success_stories = await self._find_successes(recent_metrics)
        failures = await self._find_failures(recent_metrics)

        # Create recommendations
        recommendations = self._create_recommendations(
            metrics, patterns, improvements
        )

        week_end = datetime.now()
        week_start = week_end - timedelta(days=days)

        return WeeklyReport(
            week_start=week_start,
            week_end=week_end,
            metrics=metrics,
            patterns=patterns,
            improvements=improvements,
            success_stories=success_stories,
            failures=failures,
            recommendations=recommendations
        )

    def _calculate_metrics(
        self,
        metrics: List[PerformanceMetric]
    ) -> Dict[str, Any]:
        """Calculate aggregate metrics."""
        if not metrics:
            return {
                'total_tasks': 0,
                'success_rate': 0.0,
                'avg_response_time': 0.0,
                'user_satisfaction': 0.0
            }

        # Group by type
        by_type: Dict[MetricType, List[float]] = {}
        for metric in metrics:
            if metric.type not in by_type:
                by_type[metric.type] = []
            by_type[metric.type].append(metric.value)

        # Calculate stats
        result = {}

        for metric_type, values in by_type.items():
            result[f"{metric_type.value}_avg"] = statistics.mean(values)
            result[f"{metric_type.value}_min"] = min(values)
            result[f"{metric_type.value}_max"] = max(values)
            if len(values) > 1:
                result[f"{metric_type.value}_stdev"] = statistics.stdev(values)

        result['total_metrics'] = len(metrics)

        return result

    async def _identify_patterns(
        self,
        metrics: List[PerformanceMetric]
    ) -> List[str]:
        """Identify patterns in performance."""
        patterns = []

        if not metrics:
            return patterns

        # Pattern 1: Time-based performance
        # Group by hour of day
        by_hour: Dict[int, List[float]] = {}
        for metric in metrics:
            if metric.type == MetricType.SUCCESS_RATE:
                hour = metric.timestamp.hour
                if hour not in by_hour:
                    by_hour[hour] = []
                by_hour[hour].append(metric.value)

        if by_hour:
            # Find best/worst hours
            hour_avgs = {h: statistics.mean(vals) for h, vals in by_hour.items()}
            if hour_avgs:
                best_hour = max(hour_avgs, key=hour_avgs.get)
                worst_hour = min(hour_avgs, key=hour_avgs.get)

                patterns.append(
                    f"Best performance at {best_hour}:00 "
                    f"(success rate: {hour_avgs[best_hour]:.1%})"
                )
                patterns.append(
                    f"Lowest performance at {worst_hour}:00 "
                    f"(success rate: {hour_avgs[worst_hour]:.1%})"
                )

        # Pattern 2: Task complexity correlation
        # Check if success rate correlates with complexity
        complexity_metrics = [
            m for m in metrics
            if m.type == MetricType.TASK_COMPLEXITY
        ]

        if len(complexity_metrics) > 3:
            patterns.append(
                f"Handled {len(complexity_metrics)} tasks of varying complexity"
            )

        # Pattern 3: Improvement trend
        # Check if performance is improving over time
        success_metrics = [
            m for m in metrics
            if m.type == MetricType.SUCCESS_RATE
        ]

        if len(success_metrics) > 5:
            # Compare first half vs second half
            mid = len(success_metrics) // 2
            first_half_avg = statistics.mean([m.value for m in success_metrics[:mid]])
            second_half_avg = statistics.mean([m.value for m in success_metrics[mid:]])

            if second_half_avg > first_half_avg + 0.05:
                patterns.append(
                    f"Performance improving: {first_half_avg:.1%} -> "
                    f"{second_half_avg:.1%} (+{(second_half_avg - first_half_avg):.1%})"
                )
            elif second_half_avg < first_half_avg - 0.05:
                patterns.append(
                    f"Performance declining: {first_half_avg:.1%} -> "
                    f"{second_half_avg:.1%} ({(second_half_avg - first_half_avg):.1%})"
                )

        return patterns

    async def _generate_improvements(
        self,
        metrics: Dict[str, Any],
        patterns: List[str]
    ) -> List[ImprovementSuggestion]:
        """Generate improvement suggestions."""
        suggestions = []

        # Suggestion 1: If success rate is low
        success_rate = metrics.get('success_rate_avg', 1.0)
        if success_rate < 0.8:
            suggestions.append(ImprovementSuggestion(
                id="improve_success_rate",
                category=ImprovementCategory.ACCURACY,
                title="Improve task success rate",
                description=(
                    f"Current success rate is {success_rate:.1%}. "
                    "Consider improving error handling and task validation."
                ),
                rationale=[
                    f"Success rate below target (80%)",
                    "Better error handling could prevent failures",
                    "Enhanced validation could catch issues early"
                ],
                confidence=0.85,
                priority=1,
                estimated_impact="High - could improve success by 10-15%",
                implementation_complexity="medium",
                created_at=datetime.now()
            ))

        # Suggestion 2: If response time is high
        response_time = metrics.get('response_time_avg', 0)
        if response_time > 5.0:  # seconds
            suggestions.append(ImprovementSuggestion(
                id="optimize_response_time",
                category=ImprovementCategory.PERFORMANCE,
                title="Optimize response time",
                description=(
                    f"Average response time is {response_time:.1f}s. "
                    "Consider caching frequently used data and optimizing queries."
                ),
                rationale=[
                    f"Response time above target (3s)",
                    "Users prefer faster responses",
                    "Caching could reduce repeated work"
                ],
                confidence=0.80,
                priority=2,
                estimated_impact="Medium - could reduce latency by 30-40%",
                implementation_complexity="low",
                created_at=datetime.now()
            ))

        # Suggestion 3: Learning from patterns
        if any("declining" in p.lower() for p in patterns):
            suggestions.append(ImprovementSuggestion(
                id="investigate_decline",
                category=ImprovementCategory.LEARNING,
                title="Investigate performance decline",
                description=(
                    "Performance has declined recently. "
                    "Review recent changes and identify root cause."
                ),
                rationale=[
                    "Performance trending downward",
                    "Early intervention prevents bigger issues",
                    "Root cause analysis needed"
                ],
                confidence=0.90,
                priority=1,
                estimated_impact="High - prevent further degradation",
                implementation_complexity="low",
                created_at=datetime.now()
            ))

        return suggestions

    async def _find_successes(
        self,
        metrics: List[PerformanceMetric]
    ) -> List[str]:
        """Find recent successes."""
        successes = []

        # Find high-performing tasks
        high_performers = [
            m for m in metrics
            if m.type == MetricType.SUCCESS_RATE and m.value >= 0.95
        ]

        if high_performers:
            successes.append(
                f"Achieved 95%+ success rate in {len(high_performers)} tasks"
            )

        # Find fast responses
        fast_responses = [
            m for m in metrics
            if m.type == MetricType.RESPONSE_TIME and m.value <= 1.0
        ]

        if fast_responses:
            successes.append(
                f"Delivered {len(fast_responses)} responses in under 1 second"
            )

        # Find high satisfaction
        high_satisfaction = [
            m for m in metrics
            if m.type == MetricType.USER_SATISFACTION and m.value >= 4.5
        ]

        if high_satisfaction:
            successes.append(
                f"Received 4.5+ user satisfaction in {len(high_satisfaction)} interactions"
            )

        return successes

    async def _find_failures(
        self,
        metrics: List[PerformanceMetric]
    ) -> List[str]:
        """Find recent failures."""
        failures = []

        # Find low-performing tasks
        low_performers = [
            m for m in metrics
            if m.type == MetricType.SUCCESS_RATE and m.value < 0.5
        ]

        if low_performers:
            failures.append(
                f"Success rate below 50% in {len(low_performers)} tasks"
            )

        # Find slow responses
        slow_responses = [
            m for m in metrics
            if m.type == MetricType.RESPONSE_TIME and m.value > 10.0
        ]

        if slow_responses:
            failures.append(
                f"Response time exceeded 10s in {len(slow_responses)} cases"
            )

        return failures

    def _create_recommendations(
        self,
        metrics: Dict[str, Any],
        patterns: List[str],
        improvements: List[ImprovementSuggestion]
    ) -> List[str]:
        """Create actionable recommendations."""
        recommendations = []

        # From improvements
        for improvement in improvements:
            if improvement.priority <= 2:
                recommendations.append(
                    f"[{improvement.priority}] {improvement.title}: "
                    f"{improvement.description}"
                )

        # From patterns
        if any("best performance" in p.lower() for p in patterns):
            recommendations.append(
                "Consider scheduling complex tasks during peak performance hours"
            )

        # General recommendations
        if len(self.metrics_history) < 50:
            recommendations.append(
                "Collect more data for better analysis (need 50+ data points)"
            )

        return recommendations

    def format_weekly_report(self, report: WeeklyReport) -> str:
        """Format weekly report for display."""
        output = []

        # Header
        output.append("=" * 70)
        output.append("WEEKLY PERFORMANCE REPORT")
        output.append("=" * 70)

        output.append(f"\nPeriod: {report.week_start.strftime('%Y-%m-%d')} to "
                     f"{report.week_end.strftime('%Y-%m-%d')}")

        # Metrics
        output.append("\n" + "=" * 70)
        output.append("KEY METRICS")
        output.append("=" * 70)

        for key, value in report.metrics.items():
            if isinstance(value, float):
                if 'rate' in key or 'satisfaction' in key:
                    output.append(f"  {key}: {value:.1%}")
                else:
                    output.append(f"  {key}: {value:.2f}")
            else:
                output.append(f"  {key}: {value}")

        # Patterns
        if report.patterns:
            output.append("\n" + "=" * 70)
            output.append("PATTERNS IDENTIFIED")
            output.append("=" * 70)

            for pattern in report.patterns:
                output.append(f"  - {pattern}")

        # Successes
        if report.success_stories:
            output.append("\n" + "=" * 70)
            output.append("SUCCESS STORIES")
            output.append("=" * 70)

            for success in report.success_stories:
                output.append(f"  [WIN] {success}")

        # Failures
        if report.failures:
            output.append("\n" + "=" * 70)
            output.append("AREAS FOR IMPROVEMENT")
            output.append("=" * 70)

            for failure in report.failures:
                output.append(f"  [LEARN] {failure}")

        # Improvements
        if report.improvements:
            output.append("\n" + "=" * 70)
            output.append("IMPROVEMENT SUGGESTIONS")
            output.append("=" * 70)

            for imp in report.improvements:
                output.append(f"\n  [{imp.priority}] {imp.title}")
                output.append(f"      {imp.description}")
                output.append(f"      Confidence: {imp.confidence:.1%} | "
                            f"Impact: {imp.estimated_impact}")
                output.append(f"      Complexity: {imp.implementation_complexity}")

        # Recommendations
        if report.recommendations:
            output.append("\n" + "=" * 70)
            output.append("RECOMMENDATIONS")
            output.append("=" * 70)

            for rec in report.recommendations:
                output.append(f"  - {rec}")

        output.append("\n" + "=" * 70)

        return "\n".join(output)

    def _store_metric(self, metric: PerformanceMetric):
        """Store metric in database."""
        # TODO: Implement database storage
        pass
