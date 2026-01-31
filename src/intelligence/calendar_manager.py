"""
Calendar Manager - Create and manage calendar events from detected meetings.

Integrates meeting detection with Google Calendar to:
- Create events from detected meeting requests
- Update existing events
- Send meeting invitations
- Handle meeting confirmations
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# Project root for config access
PROJECT_ROOT = Path(__file__).parent.parent.parent


class EventStatus(Enum):
    """Status of a calendar event."""
    DRAFT = "draft"
    PENDING_CONFIRMATION = "pending_confirmation"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"


@dataclass
class CalendarEvent:
    """A calendar event to be created or managed."""
    title: str
    start_time: datetime
    end_time: datetime
    attendees: List[str]
    description: Optional[str] = None
    location: Optional[str] = None
    status: EventStatus = EventStatus.DRAFT
    event_id: Optional[str] = None
    source_email_id: Optional[str] = None
    conference_link: Optional[str] = None


@dataclass
class EventCreationResult:
    """Result of attempting to create a calendar event."""
    success: bool
    event_id: Optional[str]
    event_link: Optional[str]
    message: str
    conflicts: List[Dict] = None

    def __post_init__(self):
        if self.conflicts is None:
            self.conflicts = []


class CalendarManager:
    """Manage calendar events from detected meetings."""

    def __init__(self, calendar_service=None):
        """
        Initialize the calendar manager.

        Args:
            calendar_service: Optional Google Calendar service instance
        """
        self._calendar_service = calendar_service

    def get_calendar_service(self):
        """Get or create calendar service."""
        if self._calendar_service:
            return self._calendar_service

        try:
            from utils.google_auth import get_calendar_service
            config_path = PROJECT_ROOT / "config"
            self._calendar_service = get_calendar_service(
                config_path / "credentials.json",
                config_path / "token_calendar.json",
                ['https://www.googleapis.com/auth/calendar']
            )
            return self._calendar_service
        except Exception as e:
            logger.warning(f"Could not initialize calendar service: {e}")
            return None

    def create_event(
        self,
        event: CalendarEvent,
        calendar_id: str = 'primary',
        send_invitations: bool = True
    ) -> EventCreationResult:
        """
        Create a calendar event.

        Args:
            event: CalendarEvent to create
            calendar_id: Google Calendar ID
            send_invitations: Whether to send email invitations to attendees

        Returns:
            EventCreationResult with success status and event details
        """
        # Check availability first
        from .availability_checker import get_availability_checker
        checker = get_availability_checker()
        availability = checker.check_availability(
            event.start_time,
            event.end_time,
            calendar_id
        )

        if not availability.is_available:
            return EventCreationResult(
                success=False,
                event_id=None,
                event_link=None,
                message=f"Time slot not available: {availability.message}",
                conflicts=availability.conflicts
            )

        # Build event body
        event_body = {
            'summary': event.title,
            'start': {
                'dateTime': event.start_time.isoformat(),
                'timeZone': 'UTC',
            },
            'end': {
                'dateTime': event.end_time.isoformat(),
                'timeZone': 'UTC',
            },
            'attendees': [{'email': email} for email in event.attendees if email],
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'email', 'minutes': 24 * 60},
                    {'method': 'popup', 'minutes': 15},
                ],
            },
        }

        if event.description:
            event_body['description'] = event.description

        if event.location:
            event_body['location'] = event.location

        # Add conference link if provided
        if event.conference_link:
            event_body['description'] = (
                f"{event.description or ''}\n\nMeeting Link: {event.conference_link}"
            ).strip()

        # Create the event
        service = self.get_calendar_service()
        if not service:
            return EventCreationResult(
                success=False,
                event_id=None,
                event_link=None,
                message="Calendar service not available"
            )

        try:
            created_event = service.events().insert(
                calendarId=calendar_id,
                body=event_body,
                sendUpdates='all' if send_invitations else 'none'
            ).execute()

            return EventCreationResult(
                success=True,
                event_id=created_event.get('id'),
                event_link=created_event.get('htmlLink'),
                message="Event created successfully"
            )

        except Exception as e:
            logger.error(f"Failed to create event: {e}")
            return EventCreationResult(
                success=False,
                event_id=None,
                event_link=None,
                message=f"Failed to create event: {str(e)}"
            )

    def create_from_detected_meeting(
        self,
        detected_meeting,
        calendar_id: str = 'primary',
        auto_confirm: bool = False
    ) -> EventCreationResult:
        """
        Create a calendar event from a detected meeting.

        Args:
            detected_meeting: DetectedMeeting from meeting_detector
            calendar_id: Google Calendar ID
            auto_confirm: If True, create event directly. If False, create as draft.

        Returns:
            EventCreationResult with success status
        """
        from .meeting_detector import DetectedMeeting

        if not isinstance(detected_meeting, DetectedMeeting):
            return EventCreationResult(
                success=False,
                event_id=None,
                event_link=None,
                message="Invalid meeting object"
            )

        if not detected_meeting.suggested_date:
            return EventCreationResult(
                success=False,
                event_id=None,
                event_link=None,
                message="No date detected for meeting"
            )

        # Build CalendarEvent from detected meeting
        start_time = detected_meeting.suggested_date
        end_time = start_time + timedelta(minutes=detected_meeting.suggested_duration)

        # Build description from agenda items
        description_parts = []
        if detected_meeting.agenda_items:
            description_parts.append("Agenda:")
            for item in detected_meeting.agenda_items:
                description_parts.append(f"• {item}")

        description_parts.append(f"\n---\nAuto-detected from email (confidence: {detected_meeting.confidence:.0%})")

        event = CalendarEvent(
            title=detected_meeting.suggested_title,
            start_time=start_time,
            end_time=end_time,
            attendees=detected_meeting.attendees,
            description="\n".join(description_parts),
            location=detected_meeting.location,
            status=EventStatus.CONFIRMED if auto_confirm else EventStatus.DRAFT,
            source_email_id=detected_meeting.source_email_id,
            conference_link=detected_meeting.location if detected_meeting.location and 'http' in detected_meeting.location else None
        )

        if auto_confirm:
            return self.create_event(event, calendar_id)
        else:
            # Return as draft without creating
            return EventCreationResult(
                success=True,
                event_id=None,
                event_link=None,
                message="Meeting detected. Awaiting confirmation to create event."
            )

    def update_event(
        self,
        event_id: str,
        updates: Dict,
        calendar_id: str = 'primary'
    ) -> EventCreationResult:
        """
        Update an existing calendar event.

        Args:
            event_id: ID of event to update
            updates: Dictionary of fields to update
            calendar_id: Google Calendar ID

        Returns:
            EventCreationResult with update status
        """
        service = self.get_calendar_service()
        if not service:
            return EventCreationResult(
                success=False,
                event_id=event_id,
                event_link=None,
                message="Calendar service not available"
            )

        try:
            # Get existing event
            event = service.events().get(
                calendarId=calendar_id,
                eventId=event_id
            ).execute()

            # Apply updates
            for key, value in updates.items():
                if key == 'start_time':
                    event['start'] = {'dateTime': value.isoformat(), 'timeZone': 'UTC'}
                elif key == 'end_time':
                    event['end'] = {'dateTime': value.isoformat(), 'timeZone': 'UTC'}
                elif key == 'title':
                    event['summary'] = value
                elif key == 'attendees':
                    event['attendees'] = [{'email': email} for email in value]
                elif key in ['description', 'location']:
                    event[key] = value

            # Update the event
            updated_event = service.events().update(
                calendarId=calendar_id,
                eventId=event_id,
                body=event
            ).execute()

            return EventCreationResult(
                success=True,
                event_id=event_id,
                event_link=updated_event.get('htmlLink'),
                message="Event updated successfully"
            )

        except Exception as e:
            logger.error(f"Failed to update event: {e}")
            return EventCreationResult(
                success=False,
                event_id=event_id,
                event_link=None,
                message=f"Failed to update event: {str(e)}"
            )

    def cancel_event(
        self,
        event_id: str,
        calendar_id: str = 'primary',
        notify_attendees: bool = True
    ) -> EventCreationResult:
        """
        Cancel a calendar event.

        Args:
            event_id: ID of event to cancel
            calendar_id: Google Calendar ID
            notify_attendees: Whether to send cancellation emails

        Returns:
            EventCreationResult with cancellation status
        """
        service = self.get_calendar_service()
        if not service:
            return EventCreationResult(
                success=False,
                event_id=event_id,
                event_link=None,
                message="Calendar service not available"
            )

        try:
            service.events().delete(
                calendarId=calendar_id,
                eventId=event_id,
                sendUpdates='all' if notify_attendees else 'none'
            ).execute()

            return EventCreationResult(
                success=True,
                event_id=event_id,
                event_link=None,
                message="Event cancelled successfully"
            )

        except Exception as e:
            logger.error(f"Failed to cancel event: {e}")
            return EventCreationResult(
                success=False,
                event_id=event_id,
                event_link=None,
                message=f"Failed to cancel event: {str(e)}"
            )

    def get_upcoming_events(
        self,
        days_ahead: int = 7,
        calendar_id: str = 'primary',
        max_results: int = 10
    ) -> List[Dict]:
        """
        Get upcoming calendar events.

        Args:
            days_ahead: Number of days to look ahead
            calendar_id: Google Calendar ID
            max_results: Maximum number of events to return

        Returns:
            List of event dictionaries
        """
        service = self.get_calendar_service()
        if not service:
            logger.warning("Calendar service not available")
            return []

        try:
            now = datetime.utcnow()
            end = now + timedelta(days=days_ahead)

            events_result = service.events().list(
                calendarId=calendar_id,
                timeMin=now.isoformat() + 'Z',
                timeMax=end.isoformat() + 'Z',
                maxResults=max_results,
                singleEvents=True,
                orderBy='startTime'
            ).execute()

            events = []
            for event in events_result.get('items', []):
                start = event['start'].get('dateTime', event['start'].get('date'))
                end = event['end'].get('dateTime', event['end'].get('date'))

                events.append({
                    'id': event.get('id'),
                    'title': event.get('summary', 'No Title'),
                    'start': start,
                    'end': end,
                    'location': event.get('location'),
                    'attendees': [a.get('email') for a in event.get('attendees', [])],
                    'link': event.get('htmlLink')
                })

            return events

        except Exception as e:
            logger.error(f"Failed to fetch events: {e}")
            return []


# Singleton instance
_manager = None


def get_calendar_manager() -> CalendarManager:
    """Get or create the calendar manager singleton."""
    global _manager
    if _manager is None:
        _manager = CalendarManager()
    return _manager


def create_event_from_email(
    email_id: str,
    subject: str,
    body: str,
    sender: str,
    recipients: List[str] = None,
    auto_confirm: bool = False
) -> EventCreationResult:
    """
    Convenience function to detect and create event from email.

    Args:
        email_id: Unique identifier of the email
        subject: Email subject line
        body: Email body content
        sender: Sender email address
        recipients: List of recipient email addresses
        auto_confirm: If True, create event directly

    Returns:
        EventCreationResult with creation status
    """
    from .meeting_detector import detect_meeting_from_email

    # Detect meeting from email
    detected = detect_meeting_from_email(
        email_id=email_id,
        subject=subject,
        body=body,
        sender=sender,
        recipients=recipients
    )

    if not detected:
        return EventCreationResult(
            success=False,
            event_id=None,
            event_link=None,
            message="No meeting detected in email"
        )

    # Create event from detected meeting
    manager = get_calendar_manager()
    return manager.create_from_detected_meeting(detected, auto_confirm=auto_confirm)
