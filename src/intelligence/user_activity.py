from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from enum import Enum
import json
from collections import defaultdict

try:
    from src.storage.json_db import JsonDB
except ImportError:
    # Fail gracefully if storage not available (though it should be)
    JsonDB = None

class ActivityType(Enum):
    TASK_COMPLETION = "task_completion"
    EMAIL_SENT = "email_sent"
    MEETING_ATTENDED = "meeting_attended"
    SYSTEM_INTERACTION = "system_interaction"
    FOCUS_SESSION = "focus_session"
    IDLE = "idle"

class UserActivityTracker:
    """
    Tracks and analyzes user activity to identify patterns and productivity trends.
    """
    
    def __init__(self, db_name: str = "user_activity"):
        if JsonDB:
            self.db = JsonDB(db_name)
        else:
            self.db = None
            print("[UserActivityTracker] Warning: JsonDB not found, persistence disabled.")
            
    def log_activity(self, activity_type: ActivityType, description: str, metadata: Dict[str, Any] = None):
        """Log a user activity event."""
        if not self.db:
            return

        event = {
            "id": f"{activity_type.value}_{datetime.now().timestamp()}",
            "type": activity_type.value,
            "description": description,
            "metadata": metadata or {},
            "timestamp": datetime.now().isoformat()
        }
        
        # We store simple list of events. 
        # In production this might need rotation or specific date-based partitioning.
        self.db.upsert_item_in_list("events", event)

    def get_recent_activities(self, hours: int = 24) -> List[Dict]:
        """Get activities from the last N hours."""
        if not self.db:
            return []

        cutoff = datetime.now() - timedelta(hours=hours)
        events = self.db.get("events", [])
        
        recent = []
        for e in events:
            try:
                ts = datetime.fromisoformat(e['timestamp'])
                if ts >= cutoff:
                    recent.append(e)
            except (ValueError, KeyError):
                continue
                
        return sorted(recent, key=lambda x: x['timestamp'], reverse=True)

    def analyze_session_duration(self) -> float:
        """
        Estimate current active session duration in hours.
        Calculated based on density of recent events.
        """
        recent = self.get_recent_activities(hours=4) # look back 4 hours
        if not recent:
            return 0.0

        # Simple algorithm: find gap > 30 mins, assume session started after that gap
        last_time = datetime.now()
        session_start = last_time
        
        # Sort ascending for analysis
        recent_asc = sorted(recent, key=lambda x: x['timestamp'])
        
        # Verify if the last event was recent enough to consider "active" (e.g. 15 mins)
        if not recent_asc:
            return 0.0
            
        last_event_time = datetime.fromisoformat(recent_asc[-1]['timestamp'])
        if (datetime.now() - last_event_time).total_seconds() > 900: # 15 mins idle
            return 0.0

        for i in range(len(recent_asc) - 1, 0, -1):
            curr = datetime.fromisoformat(recent_asc[i]['timestamp'])
            prev = datetime.fromisoformat(recent_asc[i-1]['timestamp'])
            
            gap_minutes = (curr - prev).total_seconds() / 60
            if gap_minutes > 30:
                session_start = curr
                break
            else:
                session_start = prev # Extend session backwards
                
        duration_hours = (datetime.now() - session_start).total_seconds() / 3600
        return duration_hours

    def get_daily_summary(self) -> Dict[str, int]:
        """Get summary of today's activities by type."""
        today_events = self.get_recent_activities(hours=24)
        summary = defaultdict(int)
        
        today_str = datetime.now().date().isoformat()
        
        for e in today_events:
            if e['timestamp'].startswith(today_str):
                summary[e['type']] += 1
                
        return dict(summary)
