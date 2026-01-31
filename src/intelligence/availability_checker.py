"""
Availability Checker - Check calendar availability and suggest meeting times.

Integrates with Google Calendar to:
- Check if a time slot is available
- Find free slots in a date range
- Suggest optimal meeting times
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# Project root for config access
PROJECT_ROOT = Path(__file__).parent.parent.parent


@dataclass
class TimeSlot:
    """A time slot for scheduling."""
    start: datetime
    end: datetime
    is_available: bool = True

    @property
    def duration_minutes(self) -> int:
        return int((self.end - self.start).total_seconds() / 60)

    def overlaps(self, other: 'TimeSlot') -> bool:
        """Check if this slot overlaps with another."""
        return not (self.end <= other.start or self.start >= other.end)


@dataclass
class AvailabilityResult:
    """Result of an availability check."""
    is_available: bool
    conflicts: List[Dict]
    suggested_alternatives: List[TimeSlot]
    message: str


class AvailabilityChecker:
    """Check calendar availability and suggest meeting times."""

    # Working hours (configurable)
    DEFAULT_WORK_START = 9  # 9 AM
    DEFAULT_WORK_END = 18   # 6 PM

    # Meeting preferences
    PREFERRED_DURATIONS = [30, 60, 45, 15, 90]  # In order of preference
    BUFFER_MINUTES = 15  # Buffer between meetings

    def __init__(
        self,
        work_start: int = None,
        work_end: int = None,
        calendar_service=None
    ):
        """
        Initialize the availability checker.

        Args:
            work_start: Start of working hours (24h format)
            work_end: End of working hours (24h format)
            calendar_service: Optional Google Calendar service instance
        """
        self.work_start = work_start or self.DEFAULT_WORK_START
        self.work_end = work_end or self.DEFAULT_WORK_END
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
                ['https://www.googleapis.com/auth/calendar.readonly']
            )
            return self._calendar_service
        except Exception as e:
            logger.warning(f"Could not initialize calendar service: {e}")
            return None

    def check_availability(
        self,
        start_time: datetime,
        end_time: datetime,
        calendar_id: str = 'primary'
    ) -> AvailabilityResult:
        """
        Check if a specific time slot is available.

        Args:
            start_time: Start of the proposed meeting
            end_time: End of the proposed meeting
            calendar_id: Google Calendar ID (default: primary)

        Returns:
            AvailabilityResult with availability status and alternatives
        """
        # Check if within working hours
        if not self._is_within_working_hours(start_time, end_time):
            return AvailabilityResult(
                is_available=False,
                conflicts=[],
                suggested_alternatives=self._find_nearby_slots(
                    start_time, (end_time - start_time).seconds // 60
                ),
                message="Proposed time is outside working hours"
            )

        # Get existing events
        events = self._get_calendar_events(
            start_time - timedelta(hours=1),
            end_time + timedelta(hours=1),
            calendar_id
        )

        # Check for conflicts
        proposed_slot = TimeSlot(start=start_time, end=end_time)
        conflicts = []

        for event in events:
            event_start = self._parse_event_time(event.get('start'))
            event_end = self._parse_event_time(event.get('end'))

            if event_start and event_end:
                event_slot = TimeSlot(start=event_start, end=event_end)
                if proposed_slot.overlaps(event_slot):
                    conflicts.append({
                        'title': event.get('summary', 'Busy'),
                        'start': event_start.isoformat(),
                        'end': event_end.isoformat()
                    })

        if conflicts:
            alternatives = self._find_free_slots(
                start_time.date(),
                (end_time - start_time).seconds // 60,
                calendar_id
            )
            return AvailabilityResult(
                is_available=False,
                conflicts=conflicts,
                suggested_alternatives=alternatives[:5],
                message=f"Conflict with {len(conflicts)} existing event(s)"
            )

        return AvailabilityResult(
            is_available=True,
            conflicts=[],
            suggested_alternatives=[],
            message="Time slot is available"
        )

    def find_free_slots(
        self,
        date: datetime,
        duration_minutes: int = 30,
        calendar_id: str = 'primary',
        max_slots: int = 5
    ) -> List[TimeSlot]:
        """
        Find free time slots on a given date.

        Args:
            date: The date to search
            duration_minutes: Required meeting duration
            calendar_id: Google Calendar ID
            max_slots: Maximum number of slots to return

        Returns:
            List of available TimeSlots
        """
        return self._find_free_slots(date, duration_minutes, calendar_id)[:max_slots]

    def suggest_meeting_times(
        self,
        duration_minutes: int = 30,
        days_ahead: int = 5,
        calendar_id: str = 'primary',
        prefer_morning: bool = False,
        prefer_afternoon: bool = False
    ) -> List[TimeSlot]:
        """
        Suggest optimal meeting times over the next several days.

        Args:
            duration_minutes: Required meeting duration
            days_ahead: Number of days to look ahead
            calendar_id: Google Calendar ID
            prefer_morning: Prefer morning slots
            prefer_afternoon: Prefer afternoon slots

        Returns:
            List of suggested TimeSlots, ranked by preference
        """
        suggestions = []
        today = datetime.now().date()

        for day_offset in range(days_ahead):
            date = datetime.combine(
                today + timedelta(days=day_offset),
                datetime.min.time()
            )

            # Skip weekends
            if date.weekday() >= 5:
                continue

            slots = self._find_free_slots(date, duration_minutes, calendar_id)

            # Apply preferences
            if prefer_morning:
                slots = sorted(slots, key=lambda s: s.start.hour)
            elif prefer_afternoon:
                slots = sorted(slots, key=lambda s: -s.start.hour if s.start.hour >= 12 else 24)

            suggestions.extend(slots[:3])  # Top 3 from each day

        # Limit total suggestions
        return suggestions[:10]

    def _is_within_working_hours(
        self,
        start_time: datetime,
        end_time: datetime
    ) -> bool:
        """Check if time range is within working hours."""
        return (
            start_time.hour >= self.work_start and
            end_time.hour <= self.work_end and
            start_time.weekday() < 5  # Not weekend
        )

    def _get_calendar_events(
        self,
        start_time: datetime,
        end_time: datetime,
        calendar_id: str = 'primary'
    ) -> List[Dict]:
        """Get events from Google Calendar."""
        service = self.get_calendar_service()
        if not service:
            logger.warning("Calendar service not available, assuming all times free")
            return []

        try:
            events_result = service.events().list(
                calendarId=calendar_id,
                timeMin=start_time.isoformat() + 'Z',
                timeMax=end_time.isoformat() + 'Z',
                singleEvents=True,
                orderBy='startTime'
            ).execute()

            return events_result.get('items', [])

        except Exception as e:
            logger.error(f"Failed to fetch calendar events: {e}")
            return []

    def _find_free_slots(
        self,
        date: datetime,
        duration_minutes: int,
        calendar_id: str = 'primary'
    ) -> List[TimeSlot]:
        """Find all free slots on a given date."""
        # Ensure we're working with a date
        if isinstance(date, datetime):
            search_date = date.date()
        else:
            search_date = date

        # Build working hours range
        day_start = datetime.combine(
            search_date,
            datetime.min.time().replace(hour=self.work_start)
        )
        day_end = datetime.combine(
            search_date,
            datetime.min.time().replace(hour=self.work_end)
        )

        # Get existing events
        events = self._get_calendar_events(day_start, day_end, calendar_id)

        # Build busy slots
        busy_slots = []
        for event in events:
            start = self._parse_event_time(event.get('start'))
            end = self._parse_event_time(event.get('end'))
            if start and end:
                # Add buffer
                buffered_start = start - timedelta(minutes=self.BUFFER_MINUTES)
                buffered_end = end + timedelta(minutes=self.BUFFER_MINUTES)
                busy_slots.append(TimeSlot(start=buffered_start, end=buffered_end))

        # Sort busy slots
        busy_slots.sort(key=lambda s: s.start)

        # Find free slots
        free_slots = []
        current_time = day_start

        for busy in busy_slots:
            if busy.start > current_time:
                # Free time before this busy slot
                free_end = min(busy.start, day_end)
                if (free_end - current_time).seconds >= duration_minutes * 60:
                    free_slots.append(TimeSlot(
                        start=current_time,
                        end=free_end
                    ))
            current_time = max(current_time, busy.end)

        # Check for free time after last busy slot
        if current_time < day_end:
            remaining = (day_end - current_time).seconds / 60
            if remaining >= duration_minutes:
                free_slots.append(TimeSlot(
                    start=current_time,
                    end=day_end
                ))

        # If no events, entire working day is free
        if not busy_slots:
            free_slots = [TimeSlot(start=day_start, end=day_end)]

        # Split large slots into meeting-sized chunks
        chunked_slots = []
        for slot in free_slots:
            chunked_slots.extend(
                self._chunk_slot(slot, duration_minutes)
            )

        return chunked_slots

    def _chunk_slot(
        self,
        slot: TimeSlot,
        duration_minutes: int
    ) -> List[TimeSlot]:
        """Split a large time slot into meeting-sized chunks."""
        chunks = []
        current = slot.start

        while current + timedelta(minutes=duration_minutes) <= slot.end:
            chunks.append(TimeSlot(
                start=current,
                end=current + timedelta(minutes=duration_minutes)
            ))
            current += timedelta(minutes=30)  # 30-min increments

        return chunks

    def _find_nearby_slots(
        self,
        target_time: datetime,
        duration_minutes: int
    ) -> List[TimeSlot]:
        """Find slots near the target time."""
        # Look for slots on the same day within working hours
        same_day = target_time.replace(
            hour=self.work_start,
            minute=0,
            second=0
        )
        return self._find_free_slots(same_day, duration_minutes)[:3]

    def _parse_event_time(self, time_dict: Dict) -> Optional[datetime]:
        """Parse event time from Google Calendar format."""
        if not time_dict:
            return None

        if 'dateTime' in time_dict:
            dt_str = time_dict['dateTime']
            # Handle timezone
            if '+' in dt_str or 'Z' in dt_str:
                dt_str = dt_str.split('+')[0].split('Z')[0]
            return datetime.fromisoformat(dt_str)
        elif 'date' in time_dict:
            return datetime.fromisoformat(time_dict['date'])

        return None


# Singleton instance
_checker = None


def get_availability_checker() -> AvailabilityChecker:
    """Get or create the availability checker singleton."""
    global _checker
    if _checker is None:
        _checker = AvailabilityChecker()
    return _checker


def check_availability(
    start_time: datetime,
    end_time: datetime,
    calendar_id: str = 'primary'
) -> AvailabilityResult:
    """
    Convenience function to check availability.

    Args:
        start_time: Start of the proposed meeting
        end_time: End of the proposed meeting
        calendar_id: Google Calendar ID

    Returns:
        AvailabilityResult with availability status
    """
    checker = get_availability_checker()
    return checker.check_availability(start_time, end_time, calendar_id)


def suggest_meeting_times(
    duration_minutes: int = 30,
    days_ahead: int = 5
) -> List[TimeSlot]:
    """
    Convenience function to suggest meeting times.

    Args:
        duration_minutes: Required meeting duration
        days_ahead: Number of days to look ahead

    Returns:
        List of suggested TimeSlots
    """
    checker = get_availability_checker()
    return checker.suggest_meeting_times(duration_minutes, days_ahead)
