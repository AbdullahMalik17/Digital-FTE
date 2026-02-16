"""
Agent Team Runner

Starts all agents and the orchestrator, managing their lifecycle.
Run as: python -m src.agents.runner
"""

import asyncio
import logging
import signal
import sys

from .base import BaseAgent
from .inbox_triage import InboxTriageAgent
from .social_media import SocialMediaAgent
from .task_orchestrator import TaskOrchestratorAgent

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("agent_runner")


async def main():
    """Start all agents and the orchestrator."""
    logger.info("=" * 60)
    logger.info("Abdullah Junior - Agent Team Starting")
    logger.info("=" * 60)

    # Create agents
    inbox = InboxTriageAgent(poll_interval=30)
    social = SocialMediaAgent(poll_interval=300)
    orchestrator = TaskOrchestratorAgent(poll_interval=30)

    # Register agents with orchestrator
    orchestrator.register_agent(inbox)
    orchestrator.register_agent(social)

    agents = [inbox, social, orchestrator]

    logger.info(f"Starting {len(agents)} agents:")
    for agent in agents:
        logger.info(f"  - {agent.name}: {agent.description}")

    # Start all agents concurrently
    tasks = [asyncio.create_task(agent.start()) for agent in agents]

    # Handle shutdown
    loop = asyncio.get_event_loop()

    def shutdown():
        logger.info("Shutting down agents...")
        for agent in agents:
            agent.stop()

    for sig in (signal.SIGINT, signal.SIGTERM):
        try:
            loop.add_signal_handler(sig, shutdown)
        except NotImplementedError:
            # Windows doesn't support add_signal_handler
            pass

    try:
        await asyncio.gather(*tasks)
    except asyncio.CancelledError:
        logger.info("Agents cancelled")
    finally:
        shutdown()
        logger.info("All agents stopped")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Agent runner interrupted")
