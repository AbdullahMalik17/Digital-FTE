"""
Demo: Context Monitor - Proactive Suggestions
Shows how the system monitors context and suggests actions.
"""

import asyncio
from datetime import datetime

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.intelligence.context_monitor import ContextMonitor
from src.intelligence.agentic_intelligence import AgenticIntelligence
from src.storage.learning_db import LearningDatabase


async def demo_context_monitoring():
    """Demo context monitoring with proactive suggestions."""
    print("\n" + "="*70)
    print("CONTEXT MONITOR - PROACTIVE SUGGESTIONS DEMO")
    print("="*70)
    print("\nThis demo shows how the agent:")
    print("  - Monitors context in the background")
    print("  - Detects patterns and opportunities")
    print("  - Suggests actions proactively")
    print("  - Learns from user feedback")
    print("\n" + "="*70)

    # Initialize
    db = LearningDatabase("Vault/Data/learning_demo.db")
    intelligence = AgenticIntelligence(
        ai_client=None,
        history_db=db,
        handbook_rules={'auto_approve_max_amount': 100}
    )

    monitor = ContextMonitor(
        intelligence=intelligence,
        learning_db=db,
        monitoring_interval=5  # Check every 5 seconds for demo
    )

    print(f"\n[Setup] Context Monitor initialized")
    print(f"[Setup] Monitoring interval: {monitor.monitoring_interval}s")
    print(f"[Setup] Active monitors: {sum(monitor.active_monitors.values())}/{len(monitor.active_monitors)}")
    print("\n" + "="*70)

    # Run a few monitoring cycles
    print("\n[Demo] Running 3 monitoring cycles...")
    print("[Demo] (In production, this would run continuously in background)")
    print("\n")

    for cycle in range(3):
        print(f"\n--- Cycle {cycle + 1}/3 ---")
        await monitor._monitoring_cycle()

        if cycle < 2:  # Don't wait after last cycle
            print(f"\n[Demo] Waiting {monitor.monitoring_interval}s for next cycle...")
            await asyncio.sleep(monitor.monitoring_interval)

    # Show statistics
    print("\n" + "="*70)
    print("DEMO COMPLETE")
    print("="*70)

    stats = monitor.get_suggestion_stats()
    print("\nContext Monitor Statistics:")
    print(f"  Total suggestions: {stats['total_suggestions']}")
    print(f"  Accepted: {stats['accepted']}")
    print(f"  Rejected: {stats['rejected']}")
    print(f"  Acceptance rate: {stats['acceptance_rate']:.1%}")

    print("\nKey Features Demonstrated:")
    print("  1. Time-based monitoring (morning/evening routines)")
    print("  2. Pattern detection (Friday wrap-up)")
    print("  3. Confidence-based filtering (only suggest high-confidence)")
    print("  4. Duplicate prevention (no repeated suggestions)")
    print("  5. Priority scoring (1-5 based on confidence)")

    print("\nNext Steps:")
    print("  - Integrate with real APIs (Gmail, Calendar, Spotify)")
    print("  - Add more context monitors (email, calendar, notifications)")
    print("  - Implement user feedback loop")
    print("  - Learn from acceptance patterns")

    print("\n" + "="*70 + "\n")

    # Cleanup
    db.close()


async def demo_feedback_learning():
    """Demo learning from user feedback."""
    print("\n" + "="*70)
    print("FEEDBACK LEARNING DEMO")
    print("="*70)
    print("\nShowing how the system learns from user feedback...")

    # Initialize
    db = LearningDatabase("Vault/Data/learning_demo.db")
    intelligence = AgenticIntelligence(
        ai_client=None,
        history_db=db,
        handbook_rules={'auto_approve_max_amount': 100}
    )

    monitor = ContextMonitor(
        intelligence=intelligence,
        learning_db=db,
        monitoring_interval=300
    )

    # Simulate some suggestions and feedback
    print("\n[Simulating] Morning routine suggestion...")
    await monitor._monitoring_cycle()

    # Get recent suggestion
    if monitor.recent_suggestions:
        suggestion = monitor.recent_suggestions[-1]

        print(f"\n[User] Accepted suggestion: {suggestion.title}")
        await monitor.record_feedback(
            suggestion_id=suggestion.id,
            accepted=True,
            user_note="Great suggestion!"
        )

        print(f"\n[System] Learning recorded")
        print(f"[System] Approval patterns stored for future suggestions")

    # Show updated stats
    stats = monitor.get_suggestion_stats()
    print(f"\n[Stats] Total: {stats['total_suggestions']}, Accepted: {stats['accepted']}")
    print(f"[Stats] Acceptance rate: {stats['acceptance_rate']:.1%}")

    print("\n" + "="*70 + "\n")

    # Cleanup
    db.close()


async def main():
    """Run all demos."""
    # Demo 1: Context monitoring with proactive suggestions
    await demo_context_monitoring()

    # Demo 2: Feedback learning
    await demo_feedback_learning()


if __name__ == "__main__":
    asyncio.run(main())
