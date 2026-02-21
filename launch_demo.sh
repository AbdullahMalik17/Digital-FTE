#!/bin/bash
# Abdullah Junior - Complete System Launch for Demo
# This script starts all services needed for the demo video

set -e

PROJECT_ROOT="/mnt/e/WEB DEVELOPMENT/Hacathan_2"
cd "$PROJECT_ROOT"

echo "=========================================="
echo "  Abdullah Junior - Demo System Launch"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    if ss -tlnp 2>/dev/null | grep -q ":$1 "; then
        return 0
    fi
    return 1
}

# Start Backend API Server
if check_port 8000; then
    echo -e "${GREEN}✓${NC} Backend API Server already running on port 8000"
else
    echo -e "${YELLOW}[1/3]${NC} Starting Backend API Server..."
    nohup python3 run_api.py > /tmp/api_server.log 2>&1 &
    sleep 5
    if check_port 8000; then
        echo -e "${GREEN}✓${NC} Backend API Server started on http://localhost:8000"
    else
        echo -e "${RED}✗${NC} Failed to start Backend API Server"
        exit 1
    fi
fi

# Start Frontend
if check_port 3000; then
    echo -e "${GREEN}✓${NC} Frontend already running on port 3000"
else
    echo -e "${YELLOW}[2/3]${NC} Starting Frontend..."
    cd "$PROJECT_ROOT/frontend"
    nohup npm run start > /tmp/frontend.log 2>&1 &
    sleep 15
    cd "$PROJECT_ROOT"
    if check_port 3000; then
        echo -e "${GREEN}✓${NC} Frontend started on http://localhost:3000"
    else
        echo -e "${RED}✗${NC} Failed to start Frontend"
        exit 1
    fi
fi

# Verify Services
echo ""
echo -e "${YELLOW}[3/3]${NC} Verifying services..."
sleep 5

# Test Backend
if curl -s --max-time 5 http://localhost:8000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend API is healthy"
else
    echo -e "${RED}✗${NC} Backend API is not responding"
fi

# Test Frontend
if curl -s --max-time 10 http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend is responding"
else
    echo -e "${RED}✗${NC} Frontend is not responding"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}  System Ready for Demo!${NC}"
echo "=========================================="
echo ""
echo "📡 Services Running:"
echo "   - Backend API:   http://localhost:8000"
echo "   - Frontend:      http://localhost:3000"
echo ""
echo "🎬 Demo Pages:"
echo "   - Dashboard:     http://localhost:3000/"
echo "   - Tasks:         http://localhost:3000/tasks"
echo "   - Analytics:     http://localhost:3000/analytics"
echo "   - Skills:        http://localhost:3000/skills"
echo ""
echo "📊 Demo Data:"
echo "   - 4 pending tasks ready for approval"
echo "   - Analytics dashboard with mock data"
echo "   - All integrations showing as active"
echo ""
echo "🛑 To Stop Services:"
echo "   pkill -f 'next-server'"
echo "   pkill -f 'api_server'"
echo "   pkill -f 'uvicorn'"
echo ""
echo "=========================================="
echo ""
