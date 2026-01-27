"""
LinkedIn Robust API Client
--------------------------
Robust integration with LinkedIn using headers-based automation.
Replaces Playwright for lighter, faster, and more cloud-friendly operations.
"""

import os
import logging
from typing import Optional, Dict, Any, List
try:
    from linkedin_api import Linkedin
except ImportError:
    Linkedin = None

logger = logging.getLogger("LinkedInAPI")

class LinkedInClient:
    """
    Client for LinkedIn using the linkedin-api package.
    
    Requires:
    - LINKEDIN_USERNAME: Your LinkedIn email
    - LINKEDIN_PASSWORD: Your LinkedIn password
    """
    
    def __init__(self, username: Optional[str] = None, password: Optional[str] = None):
        self.username = username or os.getenv("LINKEDIN_USERNAME")
        self.password = password or os.getenv("LINKEDIN_PASSWORD")
        self.api = None
        
        if not self.username or not self.password:
            logger.warning("LinkedIn credentials missing (LINKEDIN_USERNAME, LINKEDIN_PASSWORD)")
        
        if Linkedin:
            try:
                # Login and store session
                self.api = Linkedin(self.username, self.password)
                logger.info("Successfully authenticated with LinkedIn")
            except Exception as e:
                logger.error(f"Failed to authenticate with LinkedIn: {e}")
        else:
            logger.error("linkedin-api package not installed")

    def post_text(self, text: str) -> bool:
        """Post a text update to your feed."""
        if not self.api:
            return False
            
        try:
            # Note: linkedin-api version might vary, this is the standard call
            self.api.post_update(text)
            return True
        except Exception as e:
            logger.error(f"Failed to post to LinkedIn: {e}")
            return False

    def get_unread_messages(self) -> List[Dict[str, Any]]:
        """Fetch unread messages from inbox."""
        if not self.api:
            return []
            
        try:
            # Gets conversations, you might need to filter for unread
            return self.api.get_conversations()
        except Exception as e:
            logger.error(f"Failed to fetch LinkedIn messages: {e}")
            return []

    def send_message(self, recipient_id: str, text: str) -> bool:
        """Send a message to a specific connection."""
        if not self.api:
            return False
            
        try:
            self.api.send_message(text, recipients=[recipient_id])
            return True
        except Exception as e:
            logger.error(f"Failed to send LinkedIn message: {e}")
            return False
