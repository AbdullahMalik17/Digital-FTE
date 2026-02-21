"""
Discord Integration Client
Monitors Discord DMs and server mentions for the Digital FTE agent.
Status: In Development - Not yet active
"""

import os
import logging
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

# Load from config/ folder — project convention for all integration credentials
load_dotenv(Path(__file__).resolve().parents[2] / "config" / "integrations.env")

logger = logging.getLogger(__name__)

DISCORD_BOT_TOKEN = os.getenv("DISCORD_BOT_TOKEN", "")
DISCORD_GUILD_ID = os.getenv("DISCORD_GUILD_ID", "")
DISCORD_ALLOWED_USERS = os.getenv("DISCORD_ALLOWED_USERS", "").split(",")
VAULT_PATH = Path(os.getenv("VAULT_PATH", "Vault"))


class DiscordClient:
    """
    Discord bot client for monitoring messages and executing agent commands.
    
    Planned Features:
    - Monitor DMs for task commands
    - Respond to slash commands (/task, /status, /approve)
    - Post notifications to a designated channel
    - Support for server mentions triggering agent actions
    
    Setup:
    1. Go to https://discord.com/developers/applications
    2. Create a new Application and add a Bot
    3. Copy the Bot Token to DISCORD_BOT_TOKEN in .env
    4. Enable Message Content Intent in the Bot settings
    5. Invite the bot to your server with appropriate permissions
    """

    def __init__(self):
        self.token = DISCORD_BOT_TOKEN
        self.guild_id = DISCORD_GUILD_ID
        self.allowed_users = [u.strip() for u in DISCORD_ALLOWED_USERS if u.strip()]
        self.is_connected = False

        if not self.token:
            logger.warning("DISCORD_BOT_TOKEN not set. Discord integration is disabled.")

    def is_configured(self) -> bool:
        return bool(self.token)

    async def start(self):
        """Start the Discord bot. Requires discord.py package."""
        if not self.is_configured():
            logger.info("Discord integration not configured. Skipping.")
            return

        try:
            import discord  # type: ignore
            logger.info("Starting Discord client...")
            # Full implementation coming in v2.0
            # Will use discord.Client with on_message event handling
            logger.warning("Discord client is not yet fully implemented.")
        except ImportError:
            logger.error("discord.py not installed. Run: pip install discord.py")

    def create_task_from_message(self, author: str, content: str, channel: str) -> Path:
        """Create a Vault task file from a Discord message."""
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"Discord_{timestamp}_{author[:20]}.md"
        task_path = VAULT_PATH / "Pending_Approval" / filename

        task_path.parent.mkdir(parents=True, exist_ok=True)
        task_path.write_text(
            f"# Discord Message from {author}\n\n"
            f"**Channel:** {channel}\n"
            f"**Received:** {datetime.now().isoformat()}\n\n"
            f"## Content\n\n{content}\n\n"
            f"## Action Required\n\n- [ ] Review and respond\n"
        )
        logger.info(f"Created task: {filename}")
        return task_path


def get_client() -> DiscordClient:
    return DiscordClient()


if __name__ == "__main__":
    import asyncio
    logging.basicConfig(level=logging.INFO)
    client = get_client()
    if client.is_configured():
        asyncio.run(client.start())
    else:
        print("Set DISCORD_BOT_TOKEN in .env to enable Discord integration.")
