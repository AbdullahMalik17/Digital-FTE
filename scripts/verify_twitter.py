
import os
import requests
from pathlib import Path
from dotenv import load_dotenv
import json

PROJECT_ROOT = Path(__file__).resolve().parent.parent
env_path = PROJECT_ROOT / "config" / ".env"
load_dotenv(env_path)

BEARER_TOKEN = os.getenv("TWITTER_BEARER_TOKEN")
API_KEY = os.getenv("TWITTER_API_KEY")
API_SECRET = os.getenv("TWITTER_API_SECRET")

def verify_twitter():
    print("Verifying Twitter Credentials...")
    
    if not BEARER_TOKEN or "your_" in BEARER_TOKEN:
        print("Error: Invalid or missing TWITTER_BEARER_TOKEN")
        return

    # 1. Test Bearer Token (User Context not needed for this check usually, but "me" requires user context if using OAuth 2.0 User Context, 
    # but with Bearer Token (App-only) we can check /2/tweets/search/recent or /2/users/me if User Token is handled differently.
    # Actually, simpler check: Look up a known user (e.g. Twitter/X) to test App Auth.
    
    headers = {"Authorization": f"Bearer {BEARER_TOKEN}"}
    
    # Lookup 'X' user (ID 783214) or similar to verifying API access
    url = "https://api.twitter.com/2/users/by/username/X"
    
    try:
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            print("✅ Twitter Bearer Token is VALID.")
            print(f"Response: {response.json()}")
        elif response.status_code == 401:
            print("❌ Twitter Bearer Token is INVALID (401 Unauthorized).")
        elif response.status_code == 403:
            print("❌ Twitter Bearer Token Valid but Forbidden (403). Check access level (Basic/Pro).")
            print(f"Detail: {response.text}")
        else:
            print(f"⚠️ Unexpected status: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"Error testing Twitter: {e}")

if __name__ == "__main__":
    verify_twitter()
