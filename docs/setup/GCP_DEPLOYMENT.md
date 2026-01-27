# Google Cloud Platform (GCP) Deployment Guide

This guide details how to deploy your Digital FTE (Platinum Tier) to a **Google Compute Engine (GCE)** Virtual Machine. This replaces Fly.io/Oracle Cloud as your 24/7 Cloud Agent.

---

## 1. Prerequisites

1.  **Google Cloud Account**: [Sign up here](https://cloud.google.com/) (New users get $300 credit).
2.  **Project**: Create a new project named `abdullah-junior`.
3.  **Billing**: Enable billing (required, but we will use Free Tier resources where possible).

---

## 2. Create the Virtual Machine (VM)

We will use the **Always Free** tier configuration (as of 2026).

1.  Go to **Compute Engine** -> **VM Instances**.
2.  Click **Create Instance**.
3.  **Name**: `abdullah-junior-cloud`
4.  **Region**: `us-east1` (South Carolina) or `us-west1`, `us-central1` (Regions eligible for free tier).
5.  **Machine Configuration**:
    - **Series**: `E2`
    - **Machine type**: `e2-micro` (2 vCPU, 1 GB memory).
6.  **Boot Disk**:
    - Click **Change**.
    - **OS**: `Ubuntu`.
    - **Version**: `Ubuntu 22.04 LTS` (or 24.04 LTS).
    - **Size**: `30 GB` (Standard persistent disk).
7.  **Firewall**:
    - Check **Allow HTTP traffic**.
    - Check **Allow HTTPS traffic**.
8.  Click **Create**.

---

## 3. Network Configuration (Open Port 8000)

By default, GCP blocks custom ports. We need port 8000 for the API/Webhooks.

1.  Go to **VPC Network** -> **Firewall**.
2.  Click **Create Firewall Rule**.
3.  **Name**: `allow-api-8000`
4.  **Targets**: `All instances in the network`.
5.  **Source IPv4 ranges**: `0.0.0.0/0` (Allow from anywhere).
6.  **Protocols and ports**:
    - Check `tcp`.
    - Enter `8000`.
7.  Click **Create**.

---

## 4. Static IP Address (Recommended)

To ensure your WhatsApp Webhook doesn't break if the VM restarts:

1.  Go to **VPC Network** -> **IP addresses**.
2.  Click **Reserve External Static IP**.
3.  **Name**: `abdullah-junior-ip`.
4.  **Attach to**: Select your `abdullah-junior-cloud` VM.
5.  Click **Reserve**.

---

## 5. System Setup (SSH)

1.  Click **SSH** on the VM row in the Google Cloud Console.
2.  In the terminal window that opens, run the following commands to setup the environment:

```bash
# 1. Update System
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install Git and Python
sudo apt-get install -y git python3-pip python3-venv

# 3. Clone Repository (Use HTTPS or setup SSH keys)
git clone https://github.com/YOUR_USERNAME/Hacathan_2.git
cd Hacathan_2

# 4. Run the Setup Script
chmod +x scripts/setup_cloud_vm.sh
./scripts/setup_cloud_vm.sh
```

---

## 6. Configure Secrets (The Critical Step)

Since we are moving off Fly.io, we use a local `.env` file on the VM. This file is **safe** because only you have SSH access to this VM.

1.  Create the `.env` file:
    ```bash
    cp config/.env.example .env
    nano .env
    ```

2.  **Paste your Credentials**:
    *   `API_SECRET_KEY` (The one you generated earlier)
    *   `GMAIL_TOKEN_BASE64` (Your encoded token)
    *   `WHATSAPP_API_TOKEN` (From Meta)
    *   `WHATSAPP_VERIFY_TOKEN` (Your secure word)
    *   `WORK_ZONE=cloud`

3.  Save and Exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

---

## 7. Start the Agent

We use `systemd` to keep the agent running 24/7, even if the VM restarts.

```bash
# 1. Update the service configuration if needed
nano supervisord.conf

# 2. Start the service manager (setup by the script in step 5)
sudo systemctl restart digitalfte-cloud
```

### Verify It's Working

```bash
# Check logs
tail -f Vault/Logs/today.json

# Check API
curl http://localhost:8000/api/health
```

---

## 8. Switch Webhooks (Migration)

Once your GCP VM is running:

1.  Copy your VM's **External IP**.
2.  Go to **Meta Developer Portal** (WhatsApp).
3.  Update the Webhook URL to:
    `http://<YOUR_GCP_IP>:8000/webhooks/whatsapp`
4.  Verify and Save.

---

## 9. Cleanup (Delete Fly.io)

Only do this after GCP is fully working!

```bash
# Local machine
fly apps destroy abdullah-junior-api
```
