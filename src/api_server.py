#!/usr/bin/env python3
"""
Abdullah Junior API Server - FastAPI backend for mobile notifications and dashboard.

This server provides:
1. Push notification subscription/management
2. Task approval endpoints
3. Dashboard data API
4. WebSocket for real-time updates

Run with: uvicorn src.api_server:app --reload --port 8000
"""

import os
import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# Import notification API
from notifications.api import router as notifications_router

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
VAULT_PATH = PROJECT_ROOT / "Vault"


# Initialize FastAPI
app = FastAPI(
    title="Abdullah Junior API",
    description="Backend API for Digital FTE with Agentic Intelligence",
    version="2.0.0"
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://abdullahjunior.local"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount notification routes
app.include_router(notifications_router)


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
                content = f.read_text()
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
            content = task_file.read_text()
            return {
                "id": task_id,
                "folder": folder,
                "content": content,
                "created": datetime.fromtimestamp(task_file.stat().st_ctime).isoformat(),
                "modified": datetime.fromtimestamp(task_file.stat().st_mtime).isoformat()
            }

        # Check subdirectories (for In_Progress/role)
        for sub in folder_path.glob("**/*.md"):
            if sub.stem == task_id or task_id in sub.name:
                content = sub.read_text()
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
            content = task_file.read_text()
            content += f"\n\n---\n**Rejected:** {request.note}\n"
            task_file.write_text(content)

        dest = VAULT_PATH / "Needs_Action" / task_file.name
        shutil.move(str(task_file), str(dest))
        return {"status": "rejected", "message": f"Task {task_id} rejected"}


@app.post("/api/tasks/{task_id}/reject")
async def reject_task(task_id: str):
    """Shortcut to reject a task."""
    return await approve_task(task_id, TaskApprovalRequest(approved=False))


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
            data = json.loads(f.read_text())
            suggestions.append(data)
        except:
            pass

    return {"suggestions": suggestions}


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
