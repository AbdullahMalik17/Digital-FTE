
import requests
import os
from pathlib import Path
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent
env_path = PROJECT_ROOT / "config" / ".env"
load_dotenv(env_path)

ACCESS_TOKEN = os.getenv("META_ACCESS_TOKEN")
PAGE_ID = os.getenv("FACEBOOK_PAGE_ID")
GRAPH_VERSION = os.getenv("GRAPH_API_VERSION", "v18.0")
BASE_URL = f"https://graph.facebook.com/{GRAPH_VERSION}"

def main():
    print(f"Checking Page ID: {PAGE_ID}")
    if not PAGE_ID or not ACCESS_TOKEN:
        print("Missing PAGE_ID or TOKEN.")
        return

    url = f"{BASE_URL}/{PAGE_ID}"
    params = {
        "access_token": ACCESS_TOKEN,
        "fields": "name,instagram_business_account"
    }
    
    try:
        response = requests.get(url, params=params)
        data = response.json()
        print(f"Response: {data}")
        
        insta = data.get("instagram_business_account")
        if insta:
            insta_id = insta.get("id")
            print(f"✅ FOUND INSTAGRAM ID: {insta_id}")
            
            # Auto-update .env
            with open(env_path, "a") as f:
                f.write(f"\nINSTAGRAM_ACCOUNT_ID={insta_id}\n")
            print("Updated .env successfully.")
        else:
            print("❌ No Instagram Business Account linked to this page object.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
