
import requests
import os
from pathlib import Path
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent
env_path = PROJECT_ROOT / "config" / ".env"
load_dotenv(env_path)

ACCESS_TOKEN = os.getenv("META_ACCESS_TOKEN")
GRAPH_VERSION = os.getenv("GRAPH_API_VERSION", "v18.0")
BASE_URL = f"https://graph.facebook.com/{GRAPH_VERSION}"

def get_pages():
    print(f"Fetching pages using token: {ACCESS_TOKEN[:10]}...")
    url = f"{BASE_URL}/me/accounts"
    params = {
        "access_token": ACCESS_TOKEN,
        "fields": "name,id,access_token"
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        return data.get("data", [])
    except Exception as e:
        print(f"Error fetching pages: {e}")
        if response:
             print(f"Response: {response.text}")
        return []

def get_instagram_account(page_id):
    url = f"{BASE_URL}/{page_id}"
    params = {
        "access_token": ACCESS_TOKEN,
        "fields": "instagram_business_account"
    }
    try:
        response = requests.get(url, params=params)
        data = response.json()
        return data.get("instagram_business_account", {}).get("id")
    except Exception as e:
        print(f"Error fetching Instagram for page {page_id}: {e}")
        return None

def debug_token_info():
    """Check what permissions this token has."""
    print("Debugging token permissions...")
    # Need App Access Token or User Token to debug. 
    # Actually 'me/permissions' is easier for a User Access Token.
    url = f"{BASE_URL}/me/permissions"
    params = {"access_token": ACCESS_TOKEN}
    
    try:
        response = requests.get(url, params=params)
        data = response.json()
        if "data" in data:
            perms = [p['permission'] for p in data['data'] if p['status'] == 'granted']
            print(f"Granted Permissions: {', '.join(perms)}")
            
            required = ['pages_show_list', 'instagram_basic', 'pages_read_engagement']
            missing = [p for p in required if p not in perms]
            
            if missing:
                print(f"⚠️  MISSING PERMISSIONS: {', '.join(missing)}")
                print("   -> Go back to Graph API Explorer.")
                print("   -> Add these permissions in the dropdown.")
                print("   -> Click 'Generate Access Token'.")
            else:
                print("✅ Permissions look correct.")
        else:
            print(f"Could not fetch permissions: {data}")
    except Exception as e:
        print(f"Error checking permissions: {e}")

def main():
    if not ACCESS_TOKEN or "your_" in ACCESS_TOKEN:
        print("Error: Invalid or missing META_ACCESS_TOKEN in .env")
        return

    debug_token_info()

    pages = get_pages()
    if not pages:
        print("No pages found. Make sure the user has created a Facebook Page.")
        return

    print(f"\nFound {len(pages)} Page(s):")
    
    first_page_id = None
    first_insta_id = None
    
    for page in pages:
        page_id = page['id']
        page_name = page['name']
        print(f"- {page_name} (ID: {page_id})")
        
        if not first_page_id:
            first_page_id = page_id
            
        insta_id = get_instagram_account(page_id)
        if insta_id:
            print(f"  -> Instagram Business ID: {insta_id}")
            if not first_insta_id:
                first_insta_id = insta_id
        else:
            print("  -> No Instagram Business Account linked.")

    print("\n--- UPDATING .ENV ---")
    new_lines = []
    if first_page_id:
        new_lines.append(f"FACEBOOK_PAGE_ID={first_page_id}")
    if first_insta_id:
        new_lines.append(f"INSTAGRAM_ACCOUNT_ID={first_insta_id}")
        
    if new_lines:
        with open(env_path, "a") as f:
            f.write("\n" + "\n".join(new_lines) + "\n")
        print("✅ Added IDs to .env")
    else:
        print("# No IDs found to add.")

if __name__ == "__main__":
    main()
