# WhatsApp Business API Setup Guide

## Current Status: PENDING
**Last Updated:** 2026-01-29

The WhatsApp Business API credentials have been obtained but require Meta Business verification to complete.

---

## Credentials Obtained

```env
WHATSAPP_BUSINESS_ACCOUNT_ID=904330222134778
WHATSAPP_PHONE_NUMBER_ID=873027869237882
WHATSAPP_ACCESS_TOKEN=<temporary - needs regeneration>
WHATSAPP_API_VERSION=v18.0
WHATSAPP_TEST_PHONE=+1 555 158 9814
```

These are already saved in `config/.env`.

---

## Issue Encountered

Error when trying to use the API:
```
Unsupported post request. Object with ID '873027869237882' does not exist,
cannot be loaded due to missing permissions, or does not support this operation.
```

**Root Cause:** WhatsApp Business Account not fully linked to Meta Business Account.

---

## Steps to Complete Setup

### Step 1: Verify Meta Business Account

1. Go to: https://business.facebook.com/settings/security
2. Complete **Business Verification** if not done
3. This may require:
   - Business documents
   - Phone verification
   - Domain verification

### Step 2: Re-add WhatsApp Product

1. Go to: https://developers.facebook.com/apps/
2. Select your app → **WhatsApp** product
3. **Remove** the WhatsApp product
4. **Add** it again via "Add Product" → "WhatsApp"
5. Follow the **Embedded Signup** flow carefully
6. Select the correct **Meta Business Account** when prompted

### Step 3: Complete Phone Registration

1. On WhatsApp API Setup page
2. Click **"Add phone number"** or use the test number
3. Follow the embedded signup wizard
4. Verify your phone number via SMS

### Step 4: Generate New Access Token

1. On API Setup page, generate new **Temporary Access Token**
2. OR create a **System User Token** (recommended for production):
   - Go to Business Settings → System Users
   - Create System User with Admin access
   - Add WhatsApp assets
   - Generate permanent token with:
     - `whatsapp_business_messaging`
     - `whatsapp_business_management`

### Step 5: Update config/.env

Replace the temporary token with the new one:
```env
WHATSAPP_ACCESS_TOKEN=<new_token_here>
```

### Step 6: Test Connection

Run the test script:
```bash
cd "/mnt/e/WEB DEVELOPMENT/Hacathan_2"
source .venv/bin/activate
python tests/test_social_media_apis.py
```

Or send a test message:
```python
import requests

token = "YOUR_TOKEN"
phone_id = "873027869237882"
recipient = "923040705172"  # Your number

url = f"https://graph.facebook.com/v18.0/{phone_id}/messages"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}
payload = {
    "messaging_product": "whatsapp",
    "to": recipient,
    "type": "template",
    "template": {
        "name": "hello_world",
        "language": {"code": "en_US"}
    }
}
r = requests.post(url, headers=headers, json=payload)
print(r.json())
```

---

## Alternative: Keep Browser Automation

If API setup is too complex, the current browser automation works:

```bash
python src/watchers/whatsapp_watcher.py
```

This uses Playwright to automate WhatsApp Web and requires:
- One-time QR code scan
- Browser window (can be headless after first login)

---

## Resources

- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Meta Business Verification](https://www.facebook.com/business/help/2058515294227817)
- [WhatsApp Message Templates](https://developers.facebook.com/docs/whatsapp/message-templates)

---

## Contact for Help

If stuck, check:
1. Meta Business Help Center
2. WhatsApp Business API Community
3. Stack Overflow `[whatsapp-cloud-api]` tag
