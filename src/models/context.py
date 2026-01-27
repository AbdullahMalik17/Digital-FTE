from dataclasses import dataclass
from enum import Enum
from datetime import datetime
from typing import Dict, Any, Optional

class ContextType(Enum):
    """Types of contexts to monitor."""
    EMAIL = "email"
    CALENDAR = "calendar"
    NOTIFICATION = "notification"
    ACTIVITY = "activity"
    TIME_BASED = "time_based"
    PATTERN = "pattern"
    SPOTIFY = "spotify"
    DIGITAL_ACTIVITY = "digital_activity"
    COMMUNICATION = "communication"
    SCHEDULE = "schedule"
    MOBILE = "mobile"

class SignalConfidence(Enum):
    """Confidence level of a signal."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

@dataclass
class ContextSignal:
    """A signal detected from the environment."""
    type: ContextType
    content: str
    confidence: SignalConfidence
    source: str
    timestamp: datetime
    metadata: Dict[str, Any] = None

    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}
