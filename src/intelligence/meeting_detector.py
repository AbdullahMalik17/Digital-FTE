"""
Meeting Detection System - Detects meeting requests from emails.

Analyzes email content to identify:
- Meeting requests
- Date/time mentions
- Attendee lists
- Proposed agendas
"""

import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class MeetingType(Enum):
    """Types of meetings detected."""
    ONE_ON_ONE = "one_on_one"
    TEAM_MEETING = "team_meeting"
    CLIENT_CALL = "client_call"
    INTERVIEW = "interview"
    REVIEW = "review"
    STANDUP = "standup"
    UNKNOWN = "unknown"


@dataclass
class DetectedMeeting:
    """A meeting detected from email content."""
    confidence: float  # 0-1 confidence score
    meeting_type: MeetingType
    suggested_title: str
    suggested_date: Optional[datetime]
    suggested_duration: int  # minutes
    attendees: List[str]
    location: Optional[str]
    agenda_items: List[str]
    source_email_id: str
    raw_date_text: Optional[str]


class MeetingDetector:
    """Detects meeting requests from email content."""

    # Keywords that indicate a meeting request
    MEETING_KEYWORDS = [
        "meeting", "meet", "call", "sync", "catch up", "discuss",
        "schedule", "calendar", "availability", "available",
        "let's talk", "quick chat", "hop on a call", "zoom",
        "google meet", "teams", "conference", "standup",
        "review", "demo", "presentation", "interview"
    ]

    # Date patterns
    DATE_PATTERNS = [
        # "tomorrow", "today", "next week"
        (r'\b(today|tomorrow|next week|this week)\b', 'relative'),
        # "Monday", "Tuesday", etc.
        (r'\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b', 'weekday'),
        # "January 15", "Jan 15", "15 January"
        (r'\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}\b', 'month_day'),
        (r'\b\d{1,2}\s+(january|february|march|april|may|june|july|august|september|october|november|december)\b', 'day_month'),
        # "1/15", "01/15/2024"
        (r'\b\d{1,2}/\d{1,2}(?:/\d{2,4})?\b', 'numeric'),
        # "2024-01-15"
        (r'\b\d{4}-\d{2}-\d{2}\b', 'iso'),
    ]

    # Time patterns
    TIME_PATTERNS = [
        # "3pm", "3:00pm", "15:00"
        (r'\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\b', 'time_12h'),
        (r'\b\d{1,2}:\d{2}\b', 'time_24h'),
        # "morning", "afternoon", "evening"
        (r'\b(morning|afternoon|evening)\b', 'time_period'),
    ]

    # Duration patterns
    DURATION_PATTERNS = [
        (r'\b(\d+)\s*(?:min(?:ute)?s?|mins?)\b', 'minutes'),
        (r'\b(\d+)\s*(?:hour|hr)s?\b', 'hours'),
        (r'\b(half\s+(?:an\s+)?hour|30\s*min)\b', 'half_hour'),
        (r'\b(quick|brief)\b', 'short'),
    ]

    def __init__(self):
        """Initialize the meeting detector."""
        self.compiled_date_patterns = [
            (re.compile(pattern, re.IGNORECASE), ptype)
            for pattern, ptype in self.DATE_PATTERNS
        ]
        self.compiled_time_patterns = [
            (re.compile(pattern, re.IGNORECASE), ptype)
            for pattern, ptype in self.TIME_PATTERNS
        ]
        self.compiled_duration_patterns = [
            (re.compile(pattern, re.IGNORECASE), ptype)
            for pattern, ptype in self.DURATION_PATTERNS
        ]

    def detect_meeting(
        self,
        email_id: str,
        subject: str,
        body: str,
        sender: str,
        recipients: List[str] = None
    ) -> Optional[DetectedMeeting]:
        """
        Detect if an email contains a meeting request.

        Args:
            email_id: Unique identifier of the email
            subject: Email subject line
            body: Email body content
            sender: Sender email address
            recipients: List of recipient email addresses

        Returns:
            DetectedMeeting if a meeting is detected, None otherwise
        """
        combined_text = f"{subject} {body}".lower()

        # Check for meeting keywords
        keyword_score = self._calculate_keyword_score(combined_text)
        if keyword_score < 0.3:
            return None

        # Extract meeting details
        date_info = self._extract_date(combined_text)
        time_info = self._extract_time(combined_text)
        duration = self._estimate_duration(combined_text)
        meeting_type = self._determine_meeting_type(combined_text, recipients or [])
        location = self._extract_location(combined_text)
        agenda = self._extract_agenda(body)

        # Calculate confidence
        confidence = self._calculate_confidence(
            keyword_score, date_info, time_info, location
        )

        if confidence < 0.4:
            return None

        # Build suggested datetime
        suggested_date = self._build_datetime(date_info, time_info)

        # Generate title
        suggested_title = self._generate_title(
            subject, meeting_type, sender
        )

        # Build attendee list
        attendees = [sender]
        if recipients:
            attendees.extend(recipients[:5])  # Limit to 5 attendees

        return DetectedMeeting(
            confidence=confidence,
            meeting_type=meeting_type,
            suggested_title=suggested_title,
            suggested_date=suggested_date,
            suggested_duration=duration,
            attendees=attendees,
            location=location,
            agenda_items=agenda,
            source_email_id=email_id,
            raw_date_text=date_info[1] if date_info else None
        )

    def _calculate_keyword_score(self, text: str) -> float:
        """Calculate score based on meeting keywords found."""
        found = sum(1 for kw in self.MEETING_KEYWORDS if kw in text)
        return min(found / 3, 1.0)  # Cap at 1.0

    def _extract_date(self, text: str) -> Optional[Tuple[str, str]]:
        """Extract date information from text."""
        for pattern, ptype in self.compiled_date_patterns:
            match = pattern.search(text)
            if match:
                return (ptype, match.group(0))
        return None

    def _extract_time(self, text: str) -> Optional[Tuple[str, str]]:
        """Extract time information from text."""
        for pattern, ptype in self.compiled_time_patterns:
            match = pattern.search(text)
            if match:
                return (ptype, match.group(0))
        return None

    def _estimate_duration(self, text: str) -> int:
        """Estimate meeting duration in minutes."""
        for pattern, ptype in self.compiled_duration_patterns:
            match = pattern.search(text)
            if match:
                if ptype == 'minutes':
                    return int(match.group(1))
                elif ptype == 'hours':
                    return int(match.group(1)) * 60
                elif ptype == 'half_hour':
                    return 30
                elif ptype == 'short':
                    return 15

        # Default duration based on common patterns
        if 'quick' in text or 'brief' in text:
            return 15
        elif 'standup' in text:
            return 15
        elif 'review' in text or 'demo' in text:
            return 60

        return 30  # Default 30 minutes

    def _determine_meeting_type(
        self, text: str, recipients: List[str]
    ) -> MeetingType:
        """Determine the type of meeting."""
        if 'standup' in text or 'stand-up' in text:
            return MeetingType.STANDUP
        elif 'interview' in text:
            return MeetingType.INTERVIEW
        elif 'review' in text or 'demo' in text:
            return MeetingType.REVIEW
        elif 'client' in text or 'customer' in text:
            return MeetingType.CLIENT_CALL
        elif len(recipients) > 3:
            return MeetingType.TEAM_MEETING
        elif len(recipients) <= 2:
            return MeetingType.ONE_ON_ONE

        return MeetingType.UNKNOWN

    def _extract_location(self, text: str) -> Optional[str]:
        """Extract meeting location or link."""
        # Check for video call links
        zoom_pattern = re.search(r'https?://[^\s]*zoom\.us/[^\s]+', text)
        if zoom_pattern:
            return zoom_pattern.group(0)

        meet_pattern = re.search(r'https?://meet\.google\.com/[^\s]+', text)
        if meet_pattern:
            return meet_pattern.group(0)

        teams_pattern = re.search(r'https?://teams\.microsoft\.com/[^\s]+', text)
        if teams_pattern:
            return teams_pattern.group(0)

        # Check for "at" location
        at_pattern = re.search(r'\bat\s+([A-Z][^.!?\n]+)', text, re.IGNORECASE)
        if at_pattern:
            return at_pattern.group(1).strip()[:100]

        return None

    def _extract_agenda(self, body: str) -> List[str]:
        """Extract potential agenda items from email body."""
        agenda = []

        # Look for bullet points or numbered lists
        list_pattern = re.findall(
            r'(?:^|\n)\s*(?:[-•*]|\d+[.)])\s*(.+?)(?=\n|$)',
            body
        )
        for item in list_pattern[:5]:  # Limit to 5 items
            cleaned = item.strip()
            if len(cleaned) > 10 and len(cleaned) < 200:
                agenda.append(cleaned)

        # Look for "discuss" or "talk about" phrases
        discuss_pattern = re.findall(
            r'(?:discuss|talk about|review|cover)\s+(.+?)(?:[.,]|$)',
            body,
            re.IGNORECASE
        )
        for item in discuss_pattern[:3]:
            cleaned = item.strip()
            if cleaned and cleaned not in agenda:
                agenda.append(cleaned)

        return agenda[:5]  # Max 5 agenda items

    def _calculate_confidence(
        self,
        keyword_score: float,
        date_info: Optional[Tuple],
        time_info: Optional[Tuple],
        location: Optional[str]
    ) -> float:
        """Calculate overall confidence score."""
        confidence = keyword_score * 0.4  # Keywords: 40%

        if date_info:
            confidence += 0.25  # Date found: 25%
        if time_info:
            confidence += 0.2  # Time found: 20%
        if location:
            confidence += 0.15  # Location found: 15%

        return min(confidence, 1.0)

    def _build_datetime(
        self,
        date_info: Optional[Tuple],
        time_info: Optional[Tuple]
    ) -> Optional[datetime]:
        """Build a datetime object from extracted info."""
        if not date_info:
            return None

        today = datetime.now().replace(hour=10, minute=0, second=0, microsecond=0)
        ptype, value = date_info

        try:
            if ptype == 'relative':
                if 'today' in value:
                    base_date = today
                elif 'tomorrow' in value:
                    base_date = today + timedelta(days=1)
                elif 'next week' in value:
                    base_date = today + timedelta(days=7)
                else:
                    base_date = today
            elif ptype == 'weekday':
                weekdays = ['monday', 'tuesday', 'wednesday', 'thursday',
                           'friday', 'saturday', 'sunday']
                target_day = weekdays.index(value.lower())
                current_day = today.weekday()
                days_ahead = target_day - current_day
                if days_ahead <= 0:
                    days_ahead += 7
                base_date = today + timedelta(days=days_ahead)
            else:
                base_date = today

            # Add time if available
            if time_info:
                ttype, tvalue = time_info
                if ttype == 'time_12h':
                    # Parse "3pm" or "3:00pm"
                    match = re.match(r'(\d{1,2})(?::(\d{2}))?\s*(am|pm)', tvalue, re.I)
                    if match:
                        hour = int(match.group(1))
                        minute = int(match.group(2) or 0)
                        ampm = match.group(3).lower()
                        if ampm == 'pm' and hour != 12:
                            hour += 12
                        elif ampm == 'am' and hour == 12:
                            hour = 0
                        base_date = base_date.replace(hour=hour, minute=minute)
                elif ttype == 'time_24h':
                    parts = tvalue.split(':')
                    base_date = base_date.replace(
                        hour=int(parts[0]),
                        minute=int(parts[1])
                    )
                elif ttype == 'time_period':
                    if 'morning' in tvalue:
                        base_date = base_date.replace(hour=10)
                    elif 'afternoon' in tvalue:
                        base_date = base_date.replace(hour=14)
                    elif 'evening' in tvalue:
                        base_date = base_date.replace(hour=17)

            return base_date

        except Exception as e:
            logger.warning(f"Failed to parse datetime: {e}")
            return None

    def _generate_title(
        self,
        subject: str,
        meeting_type: MeetingType,
        sender: str
    ) -> str:
        """Generate a suggested meeting title."""
        # Clean up subject
        subject_clean = re.sub(r'^(re:|fwd?:|meeting:)\s*', '', subject, flags=re.I)
        subject_clean = subject_clean.strip()

        if subject_clean and len(subject_clean) < 60:
            return subject_clean

        # Generate based on meeting type
        sender_name = sender.split('@')[0].replace('.', ' ').title()

        type_titles = {
            MeetingType.ONE_ON_ONE: f"1:1 with {sender_name}",
            MeetingType.TEAM_MEETING: "Team Meeting",
            MeetingType.CLIENT_CALL: f"Client Call - {sender_name}",
            MeetingType.INTERVIEW: "Interview",
            MeetingType.REVIEW: "Review Meeting",
            MeetingType.STANDUP: "Standup",
            MeetingType.UNKNOWN: f"Meeting with {sender_name}"
        }

        return type_titles.get(meeting_type, f"Meeting with {sender_name}")


# Singleton instance
_detector = None


def get_meeting_detector() -> MeetingDetector:
    """Get or create the meeting detector singleton."""
    global _detector
    if _detector is None:
        _detector = MeetingDetector()
    return _detector


def detect_meeting_from_email(
    email_id: str,
    subject: str,
    body: str,
    sender: str,
    recipients: List[str] = None
) -> Optional[DetectedMeeting]:
    """
    Convenience function to detect meeting from email.

    Args:
        email_id: Unique identifier of the email
        subject: Email subject line
        body: Email body content
        sender: Sender email address
        recipients: List of recipient email addresses

    Returns:
        DetectedMeeting if a meeting is detected, None otherwise
    """
    detector = get_meeting_detector()
    return detector.detect_meeting(
        email_id=email_id,
        subject=subject,
        body=body,
        sender=sender,
        recipients=recipients
    )
