# How to Get Your Credentials

This guide explains how to find the API keys and IDs needed for your `.env` file.

## 1. Twitter / X Credentials
You have already provided the Consumer Keys and Bearer Token. You still need the **Access Token** and **Access Secret** if you want to post tweets on behalf of a user.

1.  Go to the [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard).
2.  Select your Project and App.
3.  Navigate to **Keys and tokens**.
4.  Under **Authentication Tokens** (Read and Write permissions), generate the **Access Token and Secret**.
5.  Copy these into `.env`:
    - `TWITTER_ACCESS_TOKEN`
    - `TWITTER_ACCESS_SECRET`

## 2. Meta (Facebook & Instagram)
You have the Access Token. Now you need the Page and Account IDs.

### Get Facebook Page ID
1.  Go to your Facebook Page.
2.  Click **About** -> **Page Transparency** or check the URL.
3.  The ID is often at the end of the URL or in the **About** section.
4.  Alternatively, use the [Graph API Explorer](https://developers.facebook.com/tools/explorer/):
    - detailed call: `GET /me/accounts`
    - The response will list pages you manage with their `id`.
    - Copy the `id` to `FACEBOOK_PAGE_ID`.

### Get Instagram Business Account ID
*Note: Your Instagram account must be a Business account and linked to your Facebook Page.*
1.  Use the [Graph API Explorer](https://developers.facebook.com/tools/explorer/).
2.  Make a request to:
    `GET /[your-facebook-page-id]?fields=instagram_business_account`
3.  The response will look like:
    ```json
    {
      "instagram_business_account": {
        "id": "17841..."
      },
      "id": "..."
    }
    ```
4.  Copy the `instagram_business_account.id` to `INSTAGRAM_ACCOUNT_ID`.

## 3. Odoo Accounting
If you are using a hosted Odoo instance or a local one:
1.  **URL**: `http://localhost:8069` (if local) or your cloud URL (e.g., `https://mycompany.odoo.com`).
2.  **Database**: The name of your database (visible in the login screen selector). 
3.  **Username/Password**: The credentials you use to log in to the Odoo dashboard.
    - *Tip*: For API access, it is recommended to create a dedicated user with limited permissions if possible, or use your admin credentials for full control.

## 4. Gmail (Google Ecosystem)
If you haven't set this up yet:
1.  Go to [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a Project.
3.  Enable **Gmail API** and **Google Calendar API**.
4.  Go to **Credentials** -> **Create Credentials** -> **OAuth Client ID** (Desktop App).
5.  Download the JSON file.
6.  Rename it to `credentials.json` and place it in the project root.
7.  Run the agent; it will open a browser to ask for permission and generate `token.json` automatically.
