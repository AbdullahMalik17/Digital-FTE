"""
Demo: Self-Improvement Loop
Shows how the agent learns and improves over time.
"""

import asyncio
from datetime import datetime, timedelta
import random

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.intelligence.self_improvement import (
    SelfImprovementLoop,
    MetricType,
    ImprovementCategory
)


async def demo_metric_tracking():
    """Demo tracking performance metrics."""
    print("\n" + "="*70)
    print("SELF-IMPROVEMENT - METRIC TRACKING")
    print("="*70)

    loop = SelfImprovementLoop()

    print("\n[Recording] Sample performance metrics...")

    # Simulate a week of metrics
    base_time = datetime.now() - timedelta(days=7)

    for day in range(7):
        for hour in [9, 12, 15, 18]:  # 4 times per day
            timestamp = base_time + timedelta(days=day, hours=hour)

            # Success rate (improving over time)
            success_rate = 0.70 + (day * 0.03) + (random.random() * 0.1)
            loop.record_metric(
                type=MetricType.SUCCESS_RATE,
                value=min(success_rate, 1.0),
                context={'day': day, 'hour': hour}
            )

            # Response time (getting faster)
            response_time = 3.0 - (day * 0.2) + (random.random() * 0.5)
            loop.record_metric(
                type=MetricType.RESPONSE_TIME,
                value=max(response_time, 0.5),
                context={'day': day, 'hour': hour}
            )

            # User satisfaction (improving)
            satisfaction = 3.8 + (day * 0.1) + (random.random() * 0.3)
            loop.record_metric(
                type=MetricType.USER_SATISFACTION,
                value=min(satisfaction, 5.0),
                context={'day': day, 'hour': hour}
            )

    print(f"[Recorded] {len(loop.metrics_history)} performance metrics over 7 days")


async def demo_performance_analysis():
    """Demo performance analysis and reporting."""
    print("\n\n" + "="*70)
    print("PERFORMANCE ANALYSIS")
    print("="*70)

    loop = SelfImprovementLoop()

    # Simulate metrics for analysis
    print("\n[Simulating] One week of agent activity...")

    base_time = datetime.now() - timedelta(days=7)

    for day in range(7):
        for task in range(10):  # 10 tasks per day
            # Success rate: starts at 75%, improves to 90%
            success_rate = 0.75 + (day * 0.02) + (random.random() * 0.1)
            loop.record_metric(
                type=MetricType.SUCCESS_RATE,
                value=min(success_rate, 1.0),
                context={'day': day, 'task': task}
            )

            # Response time: starts at 4s, improves to 2s
            response_time = 4.0 - (day * 0.25) + (random.random() * 0.5)
            loop.record_metric(
                type=MetricType.RESPONSE_TIME,
                value=max(response_time, 1.0),
                context={'day': day, 'task': task}
            )

    print("[Analyzing] Performance patterns...")
    report = await loop.analyze_performance(days=7)

    # Display report
    print("\n" + loop.format_weekly_report(report))


async def demo_improvement_suggestions():
    """Demo improvement suggestion generation."""
    print("\n\n" + "="*70)
    print("IMPROVEMENT SUGGESTIONS")
    print("="*70)

    loop = SelfImprovementLoop()

    print("\n[Simulating] Agent with low success rate...")

    # Simulate poor performance
    for i in range(20):
        loop.record_metric(
            type=MetricType.SUCCESS_RATE,
            value=0.65 + (random.random() * 0.1),  # 65-75% success
            context={'task': i}
        )

        loop.record_metric(
            type=MetricType.RESPONSE_TIME,
            value=6.0 + (random.random() * 2.0),  # 6-8s response
            context={'task': i}
        )

    print("[Generating] Improvement suggestions...")
    report = await loop.analyze_performance(days=1)

    print("\n" + "="*70)
    print("SUGGESTED IMPROVEMENTS")
    print("="*70)

    for suggestion in report.improvements:
        print(f"\n[Priority {suggestion.priority}] {suggestion.title}")
        print(f"  Category: {suggestion.category.value}")
        print(f"  Description: {suggestion.description}")
        print(f"  Confidence: {suggestion.confidence:.1%}")
        print(f"  Impact: {suggestion.estimated_impact}")
        print(f"  Complexity: {suggestion.implementation_complexity}")
        print(f"\n  Rationale:")
        for reason in suggestion.rationale:
            print(f"    - {reason}")


async def demo_pattern_identification():
    """Demo pattern identification in performance."""
    print("\n\n" + "="*70)
    print("PATTERN IDENTIFICATION")
    print("="*70)

    loop = SelfImprovementLoop()

    print("\n[Simulating] Performance varies by time of day...")

    base_time = datetime.now() - timedelta(days=3)

    # Simulate time-based performance patterns
    for day in range(3):
        for hour in range(9, 18):  # 9am to 6pm
            # Performance is better in morning (9am-12pm)
            if 9 <= hour < 12:
                success_rate = 0.90 + (random.random() * 0.08)
            # Drops in early afternoon (12pm-2pm)
            elif 12 <= hour < 14:
                success_rate = 0.75 + (random.random() * 0.08)
            # Recovers in late afternoon (2pm-6pm)
            else:
                success_rate = 0.85 + (random.random() * 0.08)

            loop.record_metric(
                type=MetricType.SUCCESS_RATE,
                value=min(success_rate, 1.0),
                context={'day': day, 'hour': hour}
            )

    print("[Identifying] Patterns in data...")
    report = await loop.analyze_performance(days=3)

    print("\n" + "="*70)
    print("IDENTIFIED PATTERNS")
    print("="*70)

    for pattern in report.patterns:
        print(f"  - {pattern}")

    if report.recommendations:
        print("\n" + "="*70)
        print("RECOMMENDATIONS")
        print("="*70)

        for rec in report.recommendations:
            print(f"  - {rec}")


async def demo_features_overview():
    """Demo key features of self-improvement system."""
    print("\n\n" + "="*70)
    print("SELF-IMPROVEMENT SYSTEM FEATURES")
    print("="*70)

    print("\nKey Features:")
    print("  1. Performance Tracking")
    print("     - Success rate monitoring")
    print("     - Response time analysis")
    print("     - User satisfaction tracking")
    print("     - Task complexity correlation")

    print("\n  2. Pattern Recognition")
    print("     - Time-based performance patterns")
    print("     - Task type correlations")
    print("     - Improvement/decline trends")
    print("     - Anomaly detection")

    print("\n  3. Improvement Suggestions")
    print("     - Priority-based recommendations")
    print("     - Impact estimation")
    print("     - Complexity assessment")
    print("     - Confidence scoring")

    print("\n  4. Weekly Reports")
    print("     - Comprehensive metrics")
    print("     - Success stories")
    print("     - Areas for improvement")
    print("     - Actionable recommendations")

    print("\n  5. Learning Loop")
    print("     - Continuous monitoring")
    print("     - Automatic analysis")
    print("     - Suggestion generation")
    print("     - (Optional) Auto-implementation")

    print("\nBenefits:")
    print("  - Agent gets better over time")
    print("  - Identifies bottlenecks automatically")
    print("  - Data-driven improvements")
    print("  - Transparent performance tracking")
    print("  - Self-healing capabilities")


async def main():
    """Run all demos."""
    # Demo 1: Metric tracking
    await demo_metric_tracking()

    # Demo 2: Performance analysis
    await demo_performance_analysis()

    # Demo 3: Improvement suggestions
    await demo_improvement_suggestions()

    # Demo 4: Pattern identification
    await demo_pattern_identification()

    # Demo 5: Features overview
    await demo_features_overview()

    print("\n" + "="*70)
    print("DEMO COMPLETE")
    print("="*70)
    print("\nThe Self-Improvement Loop provides:")
    print("  - Continuous performance monitoring")
    print("  - Automatic pattern detection")
    print("  - Data-driven improvement suggestions")
    print("  - Weekly performance reports")
    print("  - Self-learning capabilities")
    print("\nThe agent literally gets better over time!")
    print("="*70 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
