"""
Agent Team Runner

Starts all agents and the orchestrator, managing their lifecycle.
Run as: python -m src.agents.runner
"""

import asyncio
import logging
import signal
import sys
import os
from pathlib import Path

from .base import BaseAgent, VAULT_PATH
from .inbox_triage import InboxTriageAgent
from .social_media import SocialMediaAgent
from .task_orchestrator import TaskOrchestratorAgent

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("agent_runner")


def ensure_vault_dirs():
    """Create all required Vault directories."""
    dirs = [
        "Needs_Action", "In_Progress", "Pending_Approval",
        "Approved", "Done", "Suggestions",
        "Logs", "Logs/audit",
    ]
    for d in dirs:
        (VAULT_PATH / d).mkdir(parents=True, exist_ok=True)
    logger.info(f"Vault directories verified at {VAULT_PATH}")


async def run_agent_with_retry(agent: BaseAgent, max_retries: int = 5):
    """Run an agent with automatic restart on crash."""
    retries = 0
    while retries < max_retries:
        try:
            await agent.start()
            break  # Clean exit
        except asyncio.CancelledError:
            break
        except Exception as e:
            retries += 1
            logger.error(f"[{agent.name}] Crashed (attempt {retries}/{max_retries}): {e}")
            if retries < max_retries:
                wait = min(retries * 5, 30)
                logger.info(f"[{agent.name}] Restarting in {wait}s...")
                await asyncio.sleep(wait)
            else:
                logger.error(f"[{agent.name}] Max retries reached, giving up")


async def main():
    """Start all agents and the orchestrator."""
    logger.info("=" * 60)
    logger.info("Abdullah Junior - Agent Team Starting")
    logger.info("=" * 60)

    # Ensure vault structure
    ensure_vault_dirs()

    # Log environment
    telegram_configured = bool(os.getenv("TELEGRAM_BOT_TOKEN"))
    logger.info(f"Telegram: {'configured' if telegram_configured else 'not configured (notifications disabled)'}")
    logger.info(f"Vault path: {VAULT_PATH}")

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

    # Start all agents concurrently with retry
    tasks = [asyncio.create_task(run_agent_with_retry(agent)) for agent in agents]

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
            pass  # Windows doesn't support add_signal_handler

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
