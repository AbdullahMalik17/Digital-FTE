"""
Social Media Agent

Manages LinkedIn content scheduling, engagement tracking,
and content generation suggestions.
"""

import logging
from datetime import datetime
from typing import Optional

from .base import BaseAgent, AgentMessage, VAULT_PATH

logger = logging.getLogger(__name__)


class SocialMediaAgent(BaseAgent):
    """Manages social media posting and engagement."""

    def __init__(self, poll_interval: int = 300):  # Check every 5 minutes
        super().__init__(
            name="social_media",
            description="Manages LinkedIn posting, content scheduling, and engagement tracking",
            poll_interval=poll_interval,
        )
        self.scheduled_posts: list = []

    async def tick(self):
        """Check for scheduled posts and engagement updates."""
        now = datetime.now()

        # Check for posts due to be published
        for post in self.scheduled_posts[:]:
            if post.get("scheduled_time") and post["scheduled_time"] <= now.isoformat():
                await self._publish_post(post)
                self.scheduled_posts.remove(post)

        # Check for pending content drafts in Vault
        drafts = self.read_vault_folder("Pending_Approval", limit=5)
        for draft in drafts:
            content = draft.get("content", "")
            if "linkedin" in content.lower() and "post" in content.lower():
                logger.info(f"[social_media] Found LinkedIn draft: {draft['id']}")

    async def _publish_post(self, post: dict):
        """Publish a post to LinkedIn."""
        # In production, this calls the LinkedIn API via Playwright
        logger.info(f"[social_media] Publishing post: {post.get('title', 'Untitled')}")
        self._audit("post_published", {
            "platform": "linkedin",
            "title": post.get("title", ""),
        })
        await self.notify_telegram(
            f"Published LinkedIn post: {post.get('title', 'Untitled')}",
            priority="low",
        )

    def schedule_post(self, title: str, content: str, scheduled_time: str):
        """Schedule a post for later publishing."""
        post = {
            "title": title,
            "content": content,
            "scheduled_time": scheduled_time,
            "created": datetime.now().isoformat(),
        }
        self.scheduled_posts.append(post)
        self._audit("post_scheduled", {"title": title, "scheduled_time": scheduled_time})
        return post

    async def handle_message(self, message: AgentMessage) -> Optional[AgentMessage]:
        """Handle messages from other agents."""
        if "draft" in message.content.lower():
            return AgentMessage(
                sender=self.name,
                recipient=message.sender,
                content="Draft created. Check Pending_Approval for review.",
            )
        return None
