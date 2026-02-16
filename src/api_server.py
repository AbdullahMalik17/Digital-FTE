#!/usr/bin/env python3
"""
Abdullah Junior API Server - FastAPI backend for mobile notifications and dashboard.

This server provides:
1. Push notification subscription/management
2. Task approval endpoints
3. Dashboard data API
4. WebSocket for real-time updates

Run with:
  cd src && uvicorn api_server:app --reload --port 8000
  OR
  python -m uvicorn src.api_server:app --reload --port 8000
"""

import os
import sys
import json
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

# Add src to path for imports
SRC_DIR = Path(__file__).parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# Import notification API - try multiple import paths
try:
    from notifications.api import router as notifications_router
except ImportError:
    try:
        from src.notifications.api import router as notifications_router
    except ImportError:
        notifications_router = None
        print("[API Server] Warning: Notifications module not found")

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
VAULT_PATH = PROJECT_ROOT / "Vault"

# Security Configuration
API_SECRET_KEY = os.getenv("API_SECRET_KEY", "default-dev-key-change-me")

# Initialize FastAPI
app = FastAPI(
    title="Abdullah Junior API",
    description="Backend API for Digital FTE with Agentic Intelligence",
    version="2.0.0"
)

# CORS for frontend and mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:8081",  # Expo dev server
        "http://10.0.2.2:8000",   # Android emulator
        "https://abdullahjunior.local",
        "https://abdullah-junior-api.fly.dev",
        "https://abdullah-junior.vercel.app",  # Add your potential Vercel URL
        "*"  # Allow all for mobile app and preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Middleware
@app.middleware("http")
async def verify_api_key(request: Request, call_next):
    # Allow health checks and public endpoints without auth
    if request.url.path in ["/", "/api/health", "/docs", "/openapi.json"]:
        return await call_next(request)
    
    # Allow OPTIONS requests (CORS preflight)
    if request.method == "OPTIONS":
        return await call_next(request)

    # Check for API Key
    api_key = request.headers.get("X-API-Key")
    if not api_key or api_key != API_SECRET_KEY:
        # Development mode bypass (optional, remove in production)
        if API_SECRET_KEY == "default-dev-key-change-me" and request.client.host == "127.0.0.1":
             return await call_next(request)
             
        return JSONResponse(
            status_code=401,
            content={"detail": "Invalid or missing API Key"}
        )

    return await call_next(request)

# Mount notification routes
if notifications_router:
    app.include_router(notifications_router)
else:
    print("[API Server] Notifications router not mounted")


# ==================== Models ====================

class TaskApprovalRequest(BaseModel):
    """Request to approve or reject a task."""
    approved: bool
    note: Optional[str] = None


class DashboardData(BaseModel):
    """Dashboard summary data."""
    pending_count: int
    in_progress_count: int
    done_today_count: int
    urgent_count: int
    last_updated: str


class ChatMessage(BaseModel):
    """Chat message from user."""
    message: str
    context: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    """Response from AI agent."""
    response: str
    action_taken: Optional[str] = None
    task_created: Optional[str] = None
    suggestions: Optional[List[str]] = None


# ==================== Voice Endpoints ====================

@app.post("/api/voice/transcribe")
async def transcribe_voice(request: Request):
    """
    Transcribe audio from mobile app and process as a command.
    """
    # In production, use OpenAI Whisper or Google Speech-to-Text
    # For now, we simulate success
    return {
        "status": "success",
        "transcription": "Schedule a meeting with Sarah for tomorrow at 9am",
        "action_taken": "task_drafted"
    }


# ==================== WhatsApp Webhook ====================

@app.get("/webhooks/whatsapp")
async def verify_whatsapp_webhook(request: Request):
    """
    Verify webhook for WhatsApp Cloud API.
    """
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")

    verify_token = os.getenv("WHATSAPP_VERIFY_TOKEN", "my_secure_token")

    if mode == "subscribe" and token == verify_token:
        return int(challenge)
    
    raise HTTPException(status_code=403, detail="Verification failed")

@app.post("/webhooks/whatsapp")
async def handle_whatsapp_webhook(request: Request):
    """
    Handle incoming WhatsApp messages.
    """
    try:
        body = await request.json()
        
        # Check if this is a message status update (sent/delivered/read)
        # We generally ignore these for now to reduce noise
        entry = body.get("entry", [])
        if entry and entry[0].get("changes", [])[0].get("value", {}).get("statuses"):
             return {"status": "ignored_status_update"}

        # Extract message content
        if entry:
            changes = entry[0].get("changes", [])
            if changes:
                value = changes[0].get("value", {})
                messages = value.get("messages", [])
                
                if messages:
                    msg = messages[0]
                    sender = msg.get("from")
                    text_body = msg.get("text", {}).get("body", "")
                    msg_type = msg.get("type")
                    
                    if msg_type == "text":
                        # Create a task for this message
                        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
                        task_id = f"WHATSAPP_{timestamp}_{sender}"
                        task_file = VAULT_PATH / "Needs_Action" / f"{task_id}.md"
                        
                        content = f"""# 💬 WhatsApp: {sender}

## Metadata
- **Source:** WhatsApp Cloud API
- **From:** {sender}
- **Time:** {datetime.now().isoformat()}
- **Priority:** MEDIUM

---

## Message
{text_body}

---

## Actions
- [ ] Reply
- [ ] Archive
"""
                        task_file.write_text(content, encoding='utf-8')
                        
                        # Trigger Auto-Reply if enabled
                        # (Implementation depends on the WhatsAppClient we just created)
                        # from src.integrations.whatsapp_api import WhatsAppClient
                        # client = WhatsAppClient()
                        # client.send_message(sender, "Received!")

        return {"status": "processed"}
        
    except Exception as e:
        print(f"Error processing webhook: {e}")
        # Return 200 to acknowledge receipt anyway so Meta doesn't retry
        return {"status": "error", "detail": str(e)}

# ==================== Telegram Webhook ====================

# Singleton Telegram bot instance for notifications
_telegram_bot = None

def get_telegram_bot():
    """Get or create the Telegram bot singleton (for sending notifications)."""
    global _telegram_bot
    if _telegram_bot is None:
        try:
            from notifications.telegram_bot import TelegramBot
        except ImportError:
            from src.notifications.telegram_bot import TelegramBot
        _telegram_bot = TelegramBot()
    return _telegram_bot


@app.post("/webhooks/telegram")
async def handle_telegram_webhook(request: Request):
    """
    Handle Telegram webhook updates (alternative to polling mode).
    Set webhook URL via: https://api.telegram.org/bot<TOKEN>/setWebhook?url=<YOUR_URL>/webhooks/telegram
    """
    try:
        body = await request.json()
        bot = get_telegram_bot()
        if bot.app:
            from telegram import Update
            update = Update.de_json(body, bot.bot)
            await bot.app.process_update(update)
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Telegram webhook error: {e}")
        return {"status": "error", "detail": str(e)}


@app.post("/api/telegram/notify")
async def send_telegram_notification(request: Request):
    """Send a notification via Telegram bot."""
    try:
        body = await request.json()
        bot = get_telegram_bot()

        msg_type = body.get("type", "notification")

        if msg_type == "approval":
            await bot.send_approval_request(
                task_id=body["task_id"],
                title=body["title"],
                description=body.get("description", ""),
                priority=body.get("priority", "medium"),
                source=body.get("source", "api"),
            )
        elif msg_type == "alert":
            await bot.send_alert(
                title=body["title"],
                message=body.get("message", ""),
                level=body.get("level", "info"),
            )
        elif msg_type == "digest":
            await bot.send_digest(body.get("summary", "No summary provided"))
        else:
            await bot.send_notification(body.get("text", ""))

        return {"status": "sent"}
    except Exception as e:
        logger.error(f"Telegram notify error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Endpoints ====================

@app.get("/")
async def root():
    """API root - health check."""
    return {
        "status": "operational",
        "service": "Abdullah Junior API",
        "version": "2.0.0",
        "features": [
            "push_notifications",
            "task_management",
            "agentic_intelligence"
        ],
        "timestamp": datetime.now().isoformat()
    }


@app.get("/api/health")
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "components": {
            "api": "operational",
            "vault": VAULT_PATH.exists(),
            "notifications": True
        },
        "timestamp": datetime.now().isoformat()
    }


@app.get("/api/dashboard")
async def get_dashboard():
    """Get dashboard summary data."""
    try:
        needs_action = VAULT_PATH / "Needs_Action"
        in_progress = VAULT_PATH / "In_Progress"
        done = VAULT_PATH / "Done"
        pending_approval = VAULT_PATH / "Pending_Approval"

        # Count files
        pending = len(list(needs_action.glob("*.md"))) if needs_action.exists() else 0
        pending += len(list(pending_approval.glob("*.md"))) if pending_approval.exists() else 0

        in_prog = 0
        if in_progress.exists():
            in_prog = len(list(in_progress.glob("**/*.md")))

        # Done today
        done_today = 0
        if done.exists():
            today = datetime.now().strftime("%Y-%m-%d")
            for f in done.glob("*.md"):
                if today in f.name:
                    done_today += 1

        # Count urgent (simple heuristic)
        urgent = 0
        if needs_action.exists():
            for f in needs_action.glob("*.md"):
                content = f.read_text(encoding='utf-8', errors='replace')
                if "urgent" in content.lower() or "priority: high" in content.lower():
                    urgent += 1

        return {
            "pending_count": pending,
            "in_progress_count": in_prog,
            "done_today_count": done_today,
            "urgent_count": urgent,
            "last_updated": datetime.now().isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/tasks")
async def get_tasks(folder: str = "Needs_Action", limit: int = 20):
    """Get tasks from a specific folder."""
    folder_path = VAULT_PATH / folder

    if not folder_path.exists():
        return {"tasks": [], "count": 0}

    tasks = []
    for f in sorted(folder_path.glob("*.md"), key=lambda x: x.stat().st_mtime, reverse=True)[:limit]:
        content = f.read_text()
        tasks.append({
            "id": f.stem,
            "filename": f.name,
            "content_preview": content[:200] + "..." if len(content) > 200 else content,
            "created": datetime.fromtimestamp(f.stat().st_ctime).isoformat(),
            "modified": datetime.fromtimestamp(f.stat().st_mtime).isoformat()
        })

    return {"tasks": tasks, "count": len(tasks)}


@app.get("/api/tasks/{task_id}")
async def get_task(task_id: str):
    """Get a specific task by ID."""
    # Search in multiple folders
    for folder in ["Needs_Action", "In_Progress", "Pending_Approval", "Done"]:
        folder_path = VAULT_PATH / folder

        # Check direct match
        task_file = folder_path / f"{task_id}.md"
        if task_file.exists():
            content = task_file.read_text(encoding='utf-8', errors='replace')
            return {
                "id": task_id,
                "folder": folder,
                "content": content,
                "created": datetime.fromtimestamp(task_file.stat().st_mtime).isoformat(),
                "modified": datetime.fromtimestamp(task_file.stat().st_mtime).isoformat()
            }

        # Check subdirectories (for In_Progress/role)
        for sub in folder_path.glob("**/*.md"):
            if sub.stem == task_id or task_id in sub.name:
                content = sub.read_text(encoding='utf-8', errors='replace')
                return {
                    "id": task_id,
                    "folder": folder,
                    "content": content,
                    "created": datetime.fromtimestamp(sub.stat().st_ctime).isoformat(),
                    "modified": datetime.fromtimestamp(sub.stat().st_mtime).isoformat()
                }

    raise HTTPException(status_code=404, detail="Task not found")


@app.post("/api/tasks/{task_id}/approve")
async def approve_task(task_id: str, request: TaskApprovalRequest = None):
    """Approve or reject a task."""
    import shutil

    # Find the task in Pending_Approval
    pending = VAULT_PATH / "Pending_Approval"
    task_file = None

    for f in pending.glob("*.md"):
        if task_id in f.name or f.stem == task_id:
            task_file = f
            break

    if not task_file:
        raise HTTPException(status_code=404, detail="Task not found in Pending_Approval")

    approved = request.approved if request else True

    if approved:
        # Move to Approved
        dest = VAULT_PATH / "Approved" / task_file.name
        shutil.move(str(task_file), str(dest))
        return {"status": "approved", "message": f"Task {task_id} approved"}
    else:
        # Move back to Needs_Action with rejection note
        if request and request.note:
            content = task_file.read_text(encoding='utf-8', errors='replace')
            content += f"\n\n---\n**Rejected:** {request.note}\n"
            task_file.write_text(content, encoding='utf-8')

        dest = VAULT_PATH / "Needs_Action" / task_file.name
        shutil.move(str(task_file), str(dest))
        return {"status": "rejected", "message": f"Task {task_id} rejected"}


@app.post("/api/tasks/{task_id}/reject")
async def reject_task(task_id: str):
    """Shortcut to reject a task."""
    return await approve_task(task_id, TaskApprovalRequest(approved=False))


@app.get("/api/agents/status")
async def get_agent_status():
    """Get status of all agents in the system."""
    agents = [
        {"name": "inbox_triage", "description": "Email & message triage", "icon": "📧", "status": "active"},
        {"name": "social_media", "description": "LinkedIn & social posting", "icon": "💼", "status": "active"},
        {"name": "task_orchestrator", "description": "Task routing & SLA monitoring", "icon": "🤖", "status": "active"},
        {"name": "financial", "description": "Invoice & expense tracking", "icon": "💰", "status": "standby"},
        {"name": "calendar", "description": "Meeting detection & scheduling", "icon": "📅", "status": "active"},
    ]
    return {"agents": agents, "count": len(agents), "timestamp": datetime.now().isoformat()}


@app.get("/api/skills")
async def get_skills():
    """Get available agent skills."""
    return {
        "skills": [
            { 
                "name": "Gmail Watcher", 
                "description": "Monitors inbox for urgent emails and drafts replies.", 
                "category": "Communication",
                "status": "active"
            },
            { 
                "name": "WhatsApp Cloud", 
                "description": "24/7 monitoring of WhatsApp messages via Meta Cloud API.", 
                "category": "Communication",
                "status": "active"
            },
            { 
                "name": "LinkedIn Poster", 
                "description": "Schedules and posts content to LinkedIn automatically.", 
                "category": "Social",
                "status": "active"
            },
            { 
                "name": "Financial Analyst", 
                "description": "Tracks revenue and expenses from Odoo.", 
                "category": "Finance",
                "status": "active"
            },
            { 
                "name": "System Orchestrator", 
                "description": "Manages task flow and approvals.", 
                "category": "Core",
                "status": "active"
            }
        ]
    }

@app.get("/api/drafts/count")
async def get_drafts_count():
    """Get count of drafts needing approval (for periodic sync)."""
    pending = VAULT_PATH / "Pending_Approval"

    if not pending.exists():
        return {"newCount": 0}

    count = len(list(pending.glob("*.md")))
    return {"newCount": count}


@app.get("/api/suggestions")
async def get_suggestions():
    """Get recent proactive suggestions."""
    suggestions_dir = VAULT_PATH / "Suggestions"

    if not suggestions_dir.exists():
        return {"suggestions": []}

    suggestions = []
    for f in sorted(suggestions_dir.glob("*.json"), key=lambda x: x.stat().st_mtime, reverse=True)[:10]:
        try:
            data = json.loads(f.read_text(encoding='utf-8', errors='replace'))
            suggestions.append(data)
        except:
            pass

    return {"suggestions": suggestions}


# ==================== Chat Endpoint ====================

def parse_task_metadata(content: str) -> Dict[str, Any]:
    """Parse YAML frontmatter and extract task metadata."""
    import re

    metadata = {
        "title": "Untitled Task",
        "priority": "medium",
        "source": "unknown",
        "risk_score": 0.3,
        "complexity_score": 0.3,
        "description": content[:300] if len(content) > 300 else content
    }

    # Extract YAML frontmatter
    yaml_match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if yaml_match:
        yaml_content = yaml_match.group(1)

        # Parse key-value pairs
        for line in yaml_content.split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                key = key.strip().lower()
                value = value.strip()

                if key == 'type':
                    metadata['source'] = value
                elif key == 'priority':
                    metadata['priority'] = value
                elif key == 'subject' or key == 'title':
                    metadata['title'] = value
                elif key == 'risk_score':
                    try:
                        metadata['risk_score'] = float(value)
                    except:
                        pass
                elif key == 'complexity_score':
                    try:
                        metadata['complexity_score'] = float(value)
                    except:
                        pass

    # Try to extract title from content if not in frontmatter
    if metadata['title'] == "Untitled Task":
        # Look for ## heading
        heading_match = re.search(r'^##\s+(.+)$', content, re.MULTILINE)
        if heading_match:
            metadata['title'] = heading_match.group(1).strip()
        else:
            # Use first line after frontmatter
            lines = content.split('\n')
            for line in lines:
                line = line.strip()
                if line and not line.startswith('---') and not line.startswith('#'):
                    metadata['title'] = line[:80]
                    break

    # Detect priority from content
    content_lower = content.lower()
    if 'urgent' in content_lower or 'asap' in content_lower:
        metadata['priority'] = 'urgent'
    elif 'high priority' in content_lower or 'important' in content_lower:
        metadata['priority'] = 'high'
    elif 'low priority' in content_lower:
        metadata['priority'] = 'low'

    # Get description after frontmatter
    if yaml_match:
        desc_start = yaml_match.end()
        desc_content = content[desc_start:].strip()
        metadata['description'] = desc_content[:500] if len(desc_content) > 500 else desc_content
    else:
        # If no YAML frontmatter, use the whole content as description
        metadata['description'] = content[:500] if len(content) > 500 else content

    return metadata


@app.get("/api/tasks/pending")
async def get_pending_tasks(limit: int = 20):
    """Get pending approval tasks with full metadata."""
    pending = VAULT_PATH / "Pending_Approval"

    if not pending.exists():
        return {"tasks": [], "count": 0}

    tasks = []
    for f in sorted(pending.glob("*.md"), key=lambda x: x.stat().st_mtime, reverse=True)[:limit]:
        content = f.read_text(encoding='utf-8', errors='replace')
        metadata = parse_task_metadata(content)

        tasks.append({
            "id": f.stem,
            "filename": f.name,
            "title": metadata['title'],
            "description": metadata['description'],
            "priority": metadata['priority'],
            "source": metadata['source'],
            "risk_score": metadata['risk_score'],
            "complexity_score": metadata['complexity_score'],
            "created": datetime.fromtimestamp(f.stat().st_ctime).isoformat(),
            "modified": datetime.fromtimestamp(f.stat().st_mtime).isoformat()
        })

    return {"tasks": tasks, "count": len(tasks)}


@app.get("/api/activity")
async def get_recent_activity(limit: int = 10):
    """Get recent activity from audit logs."""
    logs_dir = VAULT_PATH / "Logs" / "audit"

    if not logs_dir.exists():
        return {"activities": []}

    activities = []
    today = datetime.now().strftime("%Y-%m-%d")
    yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")

    for date_str in [today, yesterday]:
        log_file = logs_dir / f"audit_{date_str}.jsonl"
        if log_file.exists():
            lines = log_file.read_text(encoding='utf-8', errors='replace').strip().split('\n')
            for line in reversed(lines[-limit:]):
                try:
                    entry = json.loads(line)
                    activities.append({
                        "id": entry.get('timestamp', ''),
                        "type": entry.get('action', 'unknown'),
                        "title": entry.get('action', '').replace('_', ' ').title(),
                        "description": entry.get('details', {}).get('description', ''),
                        "timestamp": entry.get('timestamp', ''),
                        "status": entry.get('status', 'completed')
                    })
                except:
                    pass

        if len(activities) >= limit:
            break

    return {"activities": activities[:limit]}


@app.post("/api/chat/send")
async def send_chat_message(message: ChatMessage):
    """
    Send a message to the AI agent and get a response.

    This endpoint handles user commands and questions, routing them
    to the appropriate handler or AI model.
    """
    import re
    from datetime import timedelta

    user_message = message.message.strip()
    response_text = ""
    action_taken = None
    task_created = None
    suggestions = []

    # Simple command parsing
    user_lower = user_message.lower()

    # Status commands
    if any(kw in user_lower for kw in ['status', 'how are you', 'system status']):
        # Get dashboard stats
        dashboard = await get_dashboard()
        response_text = (
            f"System is running smoothly.\n\n"
            f"**Current Status:**\n"
            f"- Pending approvals: {dashboard['pending_count']}\n"
            f"- In progress: {dashboard['in_progress_count']}\n"
            f"- Completed today: {dashboard['done_today_count']}\n"
            f"- Urgent items: {dashboard['urgent_count']}"
        )
        suggestions = ["Show pending approvals", "What's urgent?", "Today's summary"]

    # Pending approvals
    elif any(kw in user_lower for kw in ['pending', 'approvals', 'what needs approval']):
        pending_tasks = await get_pending_tasks(limit=5)
        if pending_tasks['count'] > 0:
            task_list = "\n".join([
                f"- **{t['title']}** ({t['priority']})"
                for t in pending_tasks['tasks'][:5]
            ])
            response_text = f"You have {pending_tasks['count']} items waiting for approval:\n\n{task_list}"
        else:
            response_text = "Great news! No items pending approval right now."
        suggestions = ["Approve all low-risk", "Show details", "Refresh"]

    # Urgent items
    elif any(kw in user_lower for kw in ['urgent', 'critical', 'important']):
        dashboard = await get_dashboard()
        if dashboard['urgent_count'] > 0:
            response_text = f"You have {dashboard['urgent_count']} urgent items that need attention. Check the Approvals tab for details."
        else:
            response_text = "No urgent items at the moment. Everything is under control!"
        suggestions = ["Show all tasks", "Status update"]

    # Help / capabilities
    elif any(kw in user_lower for kw in ['help', 'what can you do', 'capabilities']):
        response_text = (
            "I'm **Abdullah Junior**, your AI assistant. Here's what I can help with:\n\n"
            "**Task Management:**\n"
            "- Check pending approvals\n"
            "- Review urgent items\n"
            "- Get status updates\n\n"
            "**Automation:**\n"
            "- Draft emails and social posts\n"
            "- Schedule LinkedIn content\n"
            "- Monitor Gmail for important messages\n\n"
            "**Business:**\n"
            "- Weekly CEO briefings\n"
            "- Transaction tracking (Odoo)\n"
            "- Performance reports"
        )
        suggestions = ["Check status", "Pending approvals", "Today's summary"]

    # Schedule / reminder commands
    elif 'schedule' in user_lower or 'remind' in user_lower:
        response_text = (
            "I can help you schedule tasks! To create a scheduled task, "
            "please provide:\n\n"
            "1. What needs to be done\n"
            "2. When it should happen\n\n"
            "For example: 'Schedule a LinkedIn post about our product launch for tomorrow at 9am'"
        )
        action_taken = "awaiting_details"
        suggestions = ["Schedule LinkedIn post", "Remind me tomorrow", "Set weekly reminder"]

    # LinkedIn related
    elif 'linkedin' in user_lower:
        response_text = (
            "I can help with LinkedIn! What would you like to do?\n\n"
            "- Draft a new post\n"
            "- Schedule content for later\n"
            "- Check engagement on recent posts"
        )
        suggestions = ["Draft a post", "Schedule for tomorrow", "Check analytics"]

    # Email related
    elif 'email' in user_lower:
        response_text = (
            "Email assistance available! I can:\n\n"
            "- Draft reply to recent emails\n"
            "- Summarize inbox\n"
            "- Flag important messages\n\n"
            "What would you like me to do?"
        )
        suggestions = ["Check inbox", "Draft reply", "Summarize unread"]

    # Create task
    elif any(kw in user_lower for kw in ['create task', 'new task', 'add task']):
        # Extract task description
        task_desc = re.sub(r'(create|new|add)\s+task\s*:?\s*', '', user_message, flags=re.IGNORECASE).strip()

        if task_desc:
            # Create task file
            task_id = f"Task_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}"
            task_file = VAULT_PATH / "Needs_Action" / f"{task_id}.md"

            task_content = f"""---
type: manual_task
priority: medium
created: {datetime.now().isoformat()}
status: pending
---

## {task_desc}

Created via mobile app chat.

## Actions
- [ ] Review and process
"""
            task_file.write_text(task_content)
            response_text = f"Task created: **{task_desc}**\n\nI've added it to your Needs_Action queue."
            task_created = task_id
            action_taken = "task_created"
        else:
            response_text = "What task would you like me to create? Please describe what needs to be done."
        suggestions = ["Show all tasks", "Create another task"]

    # Default response - use AI agent for complex queries
    else:
        # Import AI agent functionality
        try:
            from utils.ai_agent import invoke_agent

            # Create a prompt for the AI agent
            ai_prompt = f"""
            You are Abdullah Junior, a helpful AI assistant for the Digital FTE system.
            The user has asked: "{user_message}"

            Please provide a helpful response that explains what you can do to help.
            Keep your response concise and relevant to the Digital FTE system capabilities.
            If appropriate, suggest relevant actions the user can take.

            Respond in markdown format.
            """

            success, ai_response, agent_used = invoke_agent(ai_prompt, dry_run=False)

            if success:
                response_text = ai_response
            else:
                # Fallback response if AI agent fails
                response_text = (
                    f"I understand you're asking about: *\"{user_message}\"*\n\n"
                    "I'm still processing this request. Here are some things I can help with:"
                )
                suggestions = [
                    "Check system status",
                    "Show pending approvals",
                    "What's urgent?",
                    "Create a new task"
                ]
        except ImportError:
            # Fallback if AI agent utilities are not available
            response_text = (
                f"I understand you're asking about: *\"{user_message}\"*\n\n"
                "I'm still learning! Here are some things I can definitely help with right now:"
            )
            suggestions = [
                "Check system status",
                "Show pending approvals",
                "What's urgent?",
                "Create a new task"
            ]

    return {
        "response": response_text,
        "action_taken": action_taken,
        "task_created": task_created,
        "suggestions": suggestions,
        "timestamp": datetime.now().isoformat()
    }


@app.get("/api/chat/history")
async def get_chat_history(limit: int = 50):
    """Get chat history (stored in a simple log file)."""
    chat_log = VAULT_PATH / "Logs" / "chat_history.jsonl"

    if not chat_log.exists():
        return {"messages": []}

    messages = []
    lines = chat_log.read_text(encoding='utf-8', errors='replace').strip().split('\n')
    for line in lines[-limit:]:
        try:
            msg = json.loads(line)
            messages.append(msg)
        except:
            pass

    return {"messages": messages}


# ==================== Auto-Reply Endpoints ====================

class AutoReplySettings(BaseModel):
    """Settings for auto-reply functionality."""
    whatsapp_enabled: bool = True
    whatsapp_threshold: str = "high"  # low, medium, high, urgent
    gmail_enabled: bool = True
    gmail_threshold: str = "high"    # low, medium, high, urgent
    custom_message: Optional[str] = None


@app.get("/api/auto-reply/settings")
async def get_auto_reply_settings():
    """Get current auto-reply settings."""
    return {
        "whatsapp_enabled": os.getenv("WHATSAPP_AUTO_REPLY", "false").lower() == "true",
        "whatsapp_threshold": os.getenv("WHATSAPP_AUTO_REPLY_THRESHOLD", "high"),
        "gmail_enabled": os.getenv("AUTO_REPLY_ENABLED", "false").lower() == "true",
        "gmail_threshold": "high",  # Default for now
        "updated_at": datetime.now().isoformat()
    }


@app.post("/api/auto-reply/settings")
async def update_auto_reply_settings(settings: AutoReplySettings):
    """Update auto-reply settings."""
    # In a real implementation, we would update the environment/config
    # For now, we'll just return the settings as if they were updated
    # In a live system, this would require restarting the watcher services

    return {
        "success": True,
        "settings": settings.dict(),
        "message": "Settings updated (restart services to apply)",
        "updated_at": datetime.now().isoformat()
    }


@app.post("/api/auto-reply/test")
async def test_auto_reply(recipient: str, platform: str = "whatsapp"):
    """Test auto-reply functionality."""
    if platform.lower() == "whatsapp":
        # This would trigger a test auto-reply to the specified recipient
        # In a real implementation, this would interact with the WhatsApp watcher
        return {
            "success": True,
            "platform": "whatsapp",
            "recipient": recipient,
            "message": f"Test auto-reply would be sent to {recipient} on WhatsApp"
        }
    elif platform.lower() == "gmail":
        # This would trigger a test auto-reply to the specified email
        # In a real implementation, this would interact with the Gmail watcher
        return {
            "success": True,
            "platform": "gmail",
            "recipient": recipient,
            "message": f"Test auto-reply would be sent to {recipient} via Gmail"
        }
    else:
        raise HTTPException(status_code=400, detail="Platform must be 'whatsapp' or 'gmail'")


# ==================== Calendar Intelligence Endpoints ====================

class MeetingDetectionRequest(BaseModel):
    """Request for meeting detection from email content."""
    email_id: str
    subject: str
    body: str
    sender: str
    recipients: Optional[List[str]] = None


class AvailabilityCheckRequest(BaseModel):
    """Request for checking calendar availability."""
    start_time: str  # ISO format
    end_time: str    # ISO format
    calendar_id: Optional[str] = "primary"


class CreateEventRequest(BaseModel):
    """Request for creating a calendar event."""
    title: str
    start_time: str  # ISO format
    end_time: str    # ISO format
    attendees: List[str] = []
    description: Optional[str] = None
    location: Optional[str] = None
    send_invitations: bool = True


class MeetingSuggestionRequest(BaseModel):
    """Request for meeting time suggestions."""
    duration_minutes: int = 30
    days_ahead: int = 5
    prefer_morning: bool = False
    prefer_afternoon: bool = False


@app.post("/api/calendar/detect-meeting")
async def detect_meeting_from_email(request: MeetingDetectionRequest):
    """
    Detect meeting request from email content.

    Uses NLP patterns to identify meeting invitations, extract dates/times,
    attendees, and suggested agenda items.
    """
    try:
        from intelligence.meeting_detector import detect_meeting_from_email as detect_meeting

        result = detect_meeting(
            email_id=request.email_id,
            subject=request.subject,
            body=request.body,
            sender=request.sender,
            recipients=request.recipients
        )

        if result:
            return {
                "detected": True,
                "confidence": result.confidence,
                "meeting_type": result.meeting_type.value,
                "suggested_title": result.suggested_title,
                "suggested_date": result.suggested_date.isoformat() if result.suggested_date else None,
                "suggested_duration": result.suggested_duration,
                "attendees": result.attendees,
                "location": result.location,
                "agenda_items": result.agenda_items,
                "raw_date_text": result.raw_date_text
            }
        else:
            return {
                "detected": False,
                "message": "No meeting detected in email content"
            }

    except ImportError:
        return {
            "detected": False,
            "message": "Meeting detection module not available"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/calendar/check-availability")
async def check_availability(request: AvailabilityCheckRequest):
    """
    Check if a time slot is available on the calendar.

    Returns availability status, any conflicts, and suggested alternatives
    if the requested time is not available.
    """
    try:
        from intelligence.availability_checker import check_availability as check_avail

        start = datetime.fromisoformat(request.start_time.replace('Z', '+00:00').replace('+00:00', ''))
        end = datetime.fromisoformat(request.end_time.replace('Z', '+00:00').replace('+00:00', ''))

        result = check_avail(
            start_time=start,
            end_time=end,
            calendar_id=request.calendar_id
        )

        return {
            "is_available": result.is_available,
            "conflicts": result.conflicts,
            "suggested_alternatives": [
                {
                    "start": slot.start.isoformat(),
                    "end": slot.end.isoformat(),
                    "duration_minutes": slot.duration_minutes
                }
                for slot in result.suggested_alternatives
            ],
            "message": result.message
        }

    except ImportError:
        return {
            "is_available": True,
            "conflicts": [],
            "suggested_alternatives": [],
            "message": "Availability checker not available - assuming time is free"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/calendar/suggest-times")
async def suggest_meeting_times(request: MeetingSuggestionRequest):
    """
    Suggest optimal meeting times over the next several days.

    Considers working hours, existing events, and preferences for
    morning or afternoon meetings.
    """
    try:
        from intelligence.availability_checker import suggest_meeting_times as suggest_times

        slots = suggest_times(
            duration_minutes=request.duration_minutes,
            days_ahead=request.days_ahead
        )

        return {
            "suggestions": [
                {
                    "start": slot.start.isoformat(),
                    "end": slot.end.isoformat(),
                    "duration_minutes": slot.duration_minutes,
                    "day_of_week": slot.start.strftime("%A"),
                    "time_of_day": "morning" if slot.start.hour < 12 else "afternoon"
                }
                for slot in slots
            ],
            "count": len(slots),
            "parameters": {
                "duration_minutes": request.duration_minutes,
                "days_ahead": request.days_ahead
            }
        }

    except ImportError:
        # Return mock suggestions if module not available
        suggestions = []
        base_time = datetime.now().replace(hour=10, minute=0, second=0, microsecond=0)
        for day_offset in range(min(request.days_ahead, 5)):
            slot_date = base_time + timedelta(days=day_offset + 1)
            if slot_date.weekday() < 5:  # Skip weekends
                suggestions.append({
                    "start": slot_date.isoformat(),
                    "end": (slot_date + timedelta(minutes=request.duration_minutes)).isoformat(),
                    "duration_minutes": request.duration_minutes,
                    "day_of_week": slot_date.strftime("%A"),
                    "time_of_day": "morning"
                })

        return {
            "suggestions": suggestions[:5],
            "count": len(suggestions[:5]),
            "parameters": {
                "duration_minutes": request.duration_minutes,
                "days_ahead": request.days_ahead
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/calendar/create-event")
async def create_calendar_event(request: CreateEventRequest):
    """
    Create a new calendar event.

    Checks availability first, then creates the event and optionally
    sends invitations to attendees.
    """
    try:
        from intelligence.calendar_manager import get_calendar_manager, CalendarEvent

        start = datetime.fromisoformat(request.start_time.replace('Z', '+00:00').replace('+00:00', ''))
        end = datetime.fromisoformat(request.end_time.replace('Z', '+00:00').replace('+00:00', ''))

        event = CalendarEvent(
            title=request.title,
            start_time=start,
            end_time=end,
            attendees=request.attendees,
            description=request.description,
            location=request.location
        )

        manager = get_calendar_manager()
        result = manager.create_event(
            event=event,
            send_invitations=request.send_invitations
        )

        return {
            "success": result.success,
            "event_id": result.event_id,
            "event_link": result.event_link,
            "message": result.message,
            "conflicts": result.conflicts
        }

    except ImportError:
        return {
            "success": False,
            "event_id": None,
            "event_link": None,
            "message": "Calendar manager not available",
            "conflicts": []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/calendar/create-from-email")
async def create_event_from_email(request: MeetingDetectionRequest):
    """
    Detect meeting in email and create calendar event in one step.

    This combines meeting detection with event creation for streamlined
    processing of meeting request emails.
    """
    try:
        from intelligence.calendar_manager import create_event_from_email as create_from_email

        result = create_from_email(
            email_id=request.email_id,
            subject=request.subject,
            body=request.body,
            sender=request.sender,
            recipients=request.recipients,
            auto_confirm=False  # Require manual confirmation
        )

        return {
            "success": result.success,
            "event_id": result.event_id,
            "event_link": result.event_link,
            "message": result.message,
            "conflicts": result.conflicts if result.conflicts else []
        }

    except ImportError:
        return {
            "success": False,
            "event_id": None,
            "event_link": None,
            "message": "Calendar integration not available",
            "conflicts": []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/calendar/upcoming")
async def get_upcoming_events(days: int = 7, limit: int = 10):
    """
    Get upcoming calendar events.

    Returns events for the next N days to display in the dashboard
    or mobile app.
    """
    try:
        from intelligence.calendar_manager import get_calendar_manager

        manager = get_calendar_manager()
        events = manager.get_upcoming_events(
            days_ahead=days,
            max_results=limit
        )

        return {
            "events": events,
            "count": len(events),
            "parameters": {
                "days_ahead": days,
                "limit": limit
            }
        }

    except ImportError:
        # Return mock events if module not available
        mock_events = [
            {
                "id": "mock-1",
                "title": "Team Standup",
                "start": (datetime.now() + timedelta(hours=1)).isoformat(),
                "end": (datetime.now() + timedelta(hours=1, minutes=15)).isoformat(),
                "location": "Google Meet",
                "attendees": ["team@example.com"],
                "link": None
            },
            {
                "id": "mock-2",
                "title": "Project Review",
                "start": (datetime.now() + timedelta(days=1, hours=2)).isoformat(),
                "end": (datetime.now() + timedelta(days=1, hours=3)).isoformat(),
                "location": "Conference Room A",
                "attendees": ["manager@example.com"],
                "link": None
            }
        ]

        return {
            "events": mock_events,
            "count": len(mock_events),
            "parameters": {
                "days_ahead": days,
                "limit": limit
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Main ====================

if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("API_PORT", 8000))
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
