"""
Slack Integration Client  
Monitors Slack DMs and channel mentions for the Digital FTE agent.
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

SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN", "")
SLACK_APP_TOKEN = os.getenv("SLACK_APP_TOKEN", "")
SLACK_ALLOWED_USERS = os.getenv("SLACK_ALLOWED_USERS", "").split(",")
VAULT_PATH = Path(os.getenv("VAULT_PATH", "Vault"))


class SlackClient:
    """
    Slack app client using Socket Mode for real-time message monitoring.
    
    Planned Features:
    - Monitor DMs and @mentions in channels
    - Slash commands: /task, /status, /approve, /digest
    - Interactive approval buttons in messages
    - Thread-based conversation context
    - Workflow automation integration
    
    Setup:
    1. Go to https://api.slack.com/apps and create a new App
    2. Enable Socket Mode and generate an App-Level Token (SLACK_APP_TOKEN)
    3. Add Bot Token Scopes: chat:write, im:history, im:read, users:read
    4. Install the app to your workspace and copy the Bot Token (SLACK_BOT_TOKEN)
    5. Add both tokens to .env
    """

    def __init__(self):
        self.bot_token = SLACK_BOT_TOKEN
        self.app_token = SLACK_APP_TOKEN
        self.allowed_users = [u.strip() for u in SLACK_ALLOWED_USERS if u.strip()]
        self.is_connected = False

        if not self.bot_token:
            logger.warning("SLACK_BOT_TOKEN not set. Slack integration is disabled.")

    def is_configured(self) -> bool:
        return bool(self.bot_token and self.app_token)

    async def start(self):
        """Start the Slack bot using Socket Mode. Requires slack_bolt package."""
        if not self.is_configured():
            logger.info("Slack integration not configured. Skipping.")
            return

        try:
            from slack_bolt.async_app import AsyncApp  # type: ignore
            from slack_bolt.adapter.socket_mode.async_handler import AsyncSocketModeHandler  # type: ignore

            logger.info("Starting Slack client...")
            app = AsyncApp(token=self.bot_token)

            @app.event("message")
            async def handle_message(event, say):
                if event.get("channel_type") == "im":
                    user = event.get("user", "unknown")
                    text = event.get("text", "")
                    if user in self.allowed_users or not self.allowed_users:
                        self.create_task_from_message(user, text, "DM")
                        await say(f"Got it! I've created a task for: {text[:50]}...")

            handler = AsyncSocketModeHandler(app, self.app_token)
            await handler.start_async()

        except ImportError:
            logger.error("slack_bolt not installed. Run: pip install slack_bolt")

    def create_task_from_message(self, user_id: str, content: str, channel: str) -> Path:
        """Create a Vault task file from a Slack message."""
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"Slack_{timestamp}_{user_id[:20]}.md"
        task_path = VAULT_PATH / "Pending_Approval" / filename

        task_path.parent.mkdir(parents=True, exist_ok=True)
        task_path.write_text(
            f"# Slack Message from {user_id}\n\n"
            f"**Channel:** {channel}\n"
            f"**Received:** {datetime.now().isoformat()}\n\n"
            f"## Content\n\n{content}\n\n"
            f"## Action Required\n\n- [ ] Review and respond\n"
        )
        logger.info(f"Created task: {filename}")
        return task_path

    async def send_message(self, channel: str, text: str) -> bool:
        """Send a message to a Slack channel or DM."""
        if not self.bot_token:
            return False
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    "https://slack.com/api/chat.postMessage",
                    headers={"Authorization": f"Bearer {self.bot_token}"},
                    json={"channel": channel, "text": text},
                )
                return resp.json().get("ok", False)
        except Exception as e:
            logger.error(f"Failed to send Slack message: {e}")
            return False


def get_client() -> SlackClient:
    return SlackClient()


if __name__ == "__main__":
    import asyncio
    logging.basicConfig(level=logging.INFO)
    client = get_client()
    if client.is_configured():
        asyncio.run(client.start())
    else:
        print("Set SLACK_BOT_TOKEN and SLACK_APP_TOKEN in .env to enable Slack integration.")
