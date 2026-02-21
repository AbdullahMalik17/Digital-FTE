#!/bin/bash
# Abdullah Junior - Complete System Startup Script
# This script starts all services for the demo

set -e

PROJECT_ROOT="/mnt/e/WEB DEVELOPMENT/Hacathan_2"
cd "$PROJECT_ROOT"

echo "=========================================="
echo "  Abdullah Junior - System Startup"
echo "=========================================="
echo ""

# Function to check if port is in use
check_port() {
    if ss -tlnp | grep -q ":$1 "; then
        return 0
    fi
    return 1
}

# Start Backend API Server
if check_port 8000; then
    echo "✓ Backend API Server already running on port 8000"
else
    echo "[1/4] Starting Backend API Server..."
    cd "$PROJECT_ROOT"
    nohup python3 run_api.py > /tmp/api_server.log 2>&1 &
    sleep 5
    echo "  Backend API Server started on http://localhost:8000"
fi

# Start Frontend
if check_port 3000; then
    echo "✓ Frontend already running on port 3000"
else
    echo "[2/4] Starting Frontend..."
    cd "$PROJECT_ROOT/frontend"
    nohup npm run dev > /tmp/frontend.log 2>&1 &
    sleep 10
    echo "  Frontend started on http://localhost:3000"
fi

# Start Gmail Watcher
echo "[3/4] Starting Gmail Watcher..."
cd "$PROJECT_ROOT/src"
nohup python3 gmail_watcher.py > /tmp/gmail_watcher.log 2>&1 &
echo "  Gmail Watcher started"

# Start WhatsApp Cloud Watcher
echo "[4/4] Starting WhatsApp Cloud Watcher..."
nohup python3 whatsapp_cloud_watcher.py > /tmp/whatsapp_watcher.log 2>&1 &
echo "  WhatsApp Watcher started"

echo ""
echo "=========================================="
echo "  System Started Successfully!"
echo "=========================================="
echo ""
echo "Services running:"
echo "  - Backend API:   http://localhost:8000"
echo "  - Frontend:      http://localhost:3000"
echo "  - Gmail Watcher: Running"
echo "  - WhatsApp:      Running"
echo ""
echo "Access the demo at:"
echo "  - Dashboard:     http://localhost:3000/"
echo "  - Tasks:         http://localhost:3000/tasks"
echo "  - Analytics:     http://localhost:3000/analytics"
echo "  - Skills:        http://localhost:3000/skills"
echo ""
