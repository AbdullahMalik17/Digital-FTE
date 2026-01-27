"""
WhatsApp Cloud API Client
-------------------------
Official integration with Meta's WhatsApp Cloud API.
Replaces the Playwright-based watcher for robust 24/7 connectivity.
"""

import os
import requests
import logging
import json
from typing import Optional, Dict, Any, List

logger = logging.getLogger("WhatsAppCloudAPI")

class WhatsAppClient:
    """
    Client for WhatsApp Cloud API.
    
    Requires:
    - WHATSAPP_API_TOKEN: Meta System User Token
    - WHATSAPP_PHONE_ID: Phone Number ID from Meta Dashboard
    """
    
    def __init__(self, token: Optional[str] = None, phone_id: Optional[str] = None):
        self.token = token or os.getenv("WHATSAPP_API_TOKEN")
        self.phone_id = phone_id or os.getenv("WHATSAPP_PHONE_ID")
        self.base_url = f"https://graph.facebook.com/v17.0/{self.phone_id}"
        
        if not self.token or not self.phone_id:
            logger.warning("WhatsApp Cloud API credentials missing (WHATSAPP_API_TOKEN, WHATSAPP_PHONE_ID)")

    def send_message(self, to: str, text: str, preview_url: bool = False) -> Dict[str, Any]:
        """Send a text message to a phone number."""
        if not self.token:
            return {"error": "No token configured"}
            
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "text",
            "text": {
                "preview_url": preview_url,
                "body": text
            }
        }
        
        try:
            response = requests.post(f"{self.base_url}/messages", headers=headers, json=payload)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to send WhatsApp message: {e}")
            if hasattr(e, 'response') and e.response:
                logger.error(f"Response: {e.response.text}")
            return {"error": str(e)}

    def send_template(self, to: str, template_name: str, language_code: str = "en_US", components: List = None) -> Dict[str, Any]:
        """Send a template message (required for initiating conversations)."""
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "messaging_product": "whatsapp",
            "to": to,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {"code": language_code}
            }
        }
        
        if components:
            payload["template"]["components"] = components

        try:
            response = requests.post(f"{self.base_url}/messages", headers=headers, json=payload)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to send WhatsApp template: {e}")
            return {"error": str(e)}

    def mark_as_read(self, message_id: str) -> bool:
        """Mark a message as read."""
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "messaging_product": "whatsapp",
            "status": "read",
            "message_id": message_id
        }
        
        try:
            requests.post(f"{self.base_url}/messages", headers=headers, json=payload)
            return True
        except Exception as e:
            logger.error(f"Failed to mark as read: {e}")
            return False
