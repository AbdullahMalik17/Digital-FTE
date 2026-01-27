# WhatsApp Cloud API Setup Guide

This guide explains how to set up the **Official WhatsApp Cloud API** for your Digital FTE. This allows your agent to send and receive messages 24/7 without needing your phone to be connected.

---

## 1. Prerequisites
- A Facebook/Meta Account.
- A Phone Number (Ideally a new/virtual one, not your primary personal number).
- A Credit/Debit card (WhatsApp Conversations are free up to 1,000/month, but card is needed for verification).

---

## 2. Create Meta App

1.  Go to [developers.facebook.com](https://developers.facebook.com/).
2.  Click **My Apps** -> **Create App**.
3.  Select **Other** -> **Next**.
4.  Select **Business** -> **Next**.
5.  Enter App Name: `Abdullah Junior` (or similar).
6.  Enter App Contact Email.
7.  Click **Create App**.

---

## 3. Add WhatsApp Product

1.  On the App Dashboard, scroll down to find **WhatsApp**.
2.  Click **Set up**.
3.  It will create a "Business Account" automatically. Click **Continue**.

---

## 4. Get Credentials (Sandbox Mode)

You will land on the **Getting Started** page.

### A. Temporary Token
- Copy the **Temporary Access Token**.
- **Note:** This expires in 24 hours. Good for testing, bad for production.

### B. Phone Number ID
- Look for **"Phone number ID"** (e.g., `10593...`).
- Copy this ID.

### C. Send a Test Message
- Scroll down to "Send and receive messages".
- In the "To" field, enter your personal WhatsApp number.
- Click **Send Message**.
- Verify you received it on your phone.

---

## 5. Get Permanent Token (Production)

To make the agent run forever, you need a System User.

1.  Go to [Business Settings](https://business.facebook.com/settings).
2.  Navigate to **Users** -> **System Users**.
3.  Click **Add**. Name: `AgentBot`, Role: **Admin**.
4.  Click **Generate New Token**.
5.  Select your App (`Abdullah Junior`).
6.  **Permissions:** Check the following:
    - `whatsapp_business_messaging`
    - `whatsapp_business_management`
7.  Click **Generate Token**.
8.  **COPY THIS TOKEN IMMEDIATELY**. It will never be shown again.

---

## 6. Configure Webhook (Receive Messages)

1.  Go back to App Dashboard -> **WhatsApp** -> **Configuration**.
2.  Find **Webhook** section. Click **Edit**.
3.  **Callback URL:** `https://abdullah-junior-api.fly.dev/webhooks/whatsapp`
    - *Replace with your actual Fly.io URL.*
4.  **Verify Token:** Create a secure word (e.g., `my_secure_token_123`).
    - *You must set this same word in your Fly secrets: `fly secrets set WHATSAPP_VERIFY_TOKEN=my_secure_token_123`*
5.  Click **Verify and Save**.
6.  Click **Manage** (under Webhook fields).
7.  Subscribe to **`messages`**.

---

## 7. Add Phone Number (Production)

*Warning: If you use a number already on WhatsApp, the app on your phone will stop working.*

1.  Go to **WhatsApp** -> **API Setup**.
2.  Scroll to **Step 5: Add a phone number**.
3.  Click **Add phone number**.
4.  Follow the verification SMS process.

---

## 8. Final Configuration

Add these secrets to your Fly.io app:

```bash
fly secrets set WHATSAPP_API_TOKEN="<Your Permanent System User Token>"
fly secrets set WHATSAPP_PHONE_ID="<Your Phone Number ID>"
fly secrets set WHATSAPP_VERIFY_TOKEN="<Your Verify Token>"
```

Your agent is now live on WhatsApp!
