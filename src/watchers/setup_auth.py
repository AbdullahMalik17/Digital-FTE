from gmail_watcher import get_gmail_service
import sys
import logging

# Configure logging to show up in stdout
logging.basicConfig(level=logging.INFO, stream=sys.stdout)

print("Starting authentication setup...")
try:
    service = get_gmail_service()
    print("Authentication successful! token.json has been created.")
except Exception as e:
    print(f"Authentication failed: {e}")
