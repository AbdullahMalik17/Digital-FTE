"""
Task Analyzer - Extract structured information from user requests.
Layer 1 of the Agentic Intelligence system.
"""

import json
import re
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from src.models.enhancements.task_analysis import (
    TaskAnalysisResult,
    TaskDomain
)


class TaskAnalyzer:
    """
    Extract structured information from user request.

    This is Layer 1 of the Agentic Intelligence system.
    """

    # Domain keywords for classification
    DOMAIN_KEYWORDS = {
        TaskDomain.EMAIL: ["email", "send", "reply", "forward", "inbox", "mail"],
        TaskDomain.CALENDAR: ["meeting", "schedule", "calendar", "appointment", "event"],
        TaskDomain.SOCIAL_MEDIA: ["post", "tweet", "linkedin", "facebook", "instagram", "social"],
        TaskDomain.FILE_MANAGEMENT: ["file", "folder", "document", "download", "upload"],
        TaskDomain.CODE: ["code", "script", "program", "function", "debug", "git"],
        TaskDomain.AUTOMATION: ["automate", "workflow", "batch", "script", "routine"],
        TaskDomain.RESEARCH: ["research", "find", "search", "google", "investigate"],
        TaskDomain.MOBILE_CONTROL: ["phone", "mobile", "android", "ios", "notification", "sms"],
        TaskDomain.DESKTOP_CONTROL: ["laptop", "desktop", "window", "application", "screenshot"],
        TaskDomain.MUSIC: ["music", "spotify", "play", "playlist", "song", "podcast"],
        TaskDomain.PAYMENT: ["pay", "payment", "invoice", "transaction", "money", "transfer"],
        TaskDomain.ERP: ["odoo", "crm", "sales", "order", "customer", "erp"],
    }

    def __init__(self, ai_client=None, history_db=None):
        """
        Initialize task analyzer.

        Args:
            ai_client: AI client for complex analysis (Claude/OpenAI)
            history_db: Database for finding similar past tasks
        """
        self.ai = ai_client
        self.history = history_db

    async def analyze(self, user_request: str) -> TaskAnalysisResult:
        """
        Analyze user request and extract structured information.

        Example:
            Input: "Send email to john@example.com about Q1 report by Friday"
            Output: TaskAnalysisResult with:
                - intent: "Send email with Q1 report"
                - domain: TaskDomain.EMAIL
                - entities: {"recipient": "john@example.com", "deadline": "2026-01-26"}
                - constraints: ["Must send by Friday"]

        Args:
            user_request: Raw user request string

        Returns:
            TaskAnalysisResult with structured analysis
        """
        # Clean request
        request = user_request.strip()

        # Extract intent (first pass)
        intent = self._extract_intent(request)

        # Classify domain
        domain = self._classify_domain(request)

        # Extract entities
        entities = self._extract_entities(request, domain)

        # Extract constraints
        constraints = self._extract_constraints(request)

        # Determine required resources
        required_resources = self._determine_resources(domain, entities)

        # Identify ambiguities
        ambiguities = self._identify_ambiguities(request, entities)

        # Find similar past tasks (if history available)
        similar_tasks = []
        if self.history:
            similar_tasks = await self._find_similar_tasks(intent, domain)

        # Calculate confidence
        confidence = self._calculate_confidence(entities, ambiguities)

        return TaskAnalysisResult(
            intent=intent,
            domain=domain,
            entities=entities,
            constraints=constraints,
            required_resources=required_resources,
            ambiguities=ambiguities,
            similar_past_tasks=similar_tasks,
            confidence=confidence
        )

    def _extract_intent(self, request: str) -> str:
        """
        Extract user's intent in one clear sentence.

        Uses simple heuristics for now, can be enhanced with AI.
        """
        # Clean up request
        intent = request.strip()

        # Remove common filler words
        filler_words = ["please", "can you", "could you", "would you", "i need", "i want"]
        for filler in filler_words:
            intent = re.sub(rf"\b{filler}\b", "", intent, flags=re.IGNORECASE)

        # Capitalize first letter
        intent = intent.strip()
        if intent:
            intent = intent[0].upper() + intent[1:]

        # Ensure ends with period
        if intent and not intent.endswith(('.', '!', '?')):
            intent += "."

        return intent

    def _classify_domain(self, request: str) -> TaskDomain:
        """
        Classify request into a domain.

        Uses keyword matching for now, can be enhanced with AI.
        """
        request_lower = request.lower()

        # Count keyword matches per domain
        domain_scores = {}
        for domain, keywords in self.DOMAIN_KEYWORDS.items():
            score = sum(1 for kw in keywords if kw in request_lower)
            if score > 0:
                domain_scores[domain] = score

        # Return domain with highest score
        if domain_scores:
            return max(domain_scores, key=domain_scores.get)

        return TaskDomain.GENERAL

    def _extract_entities(self, request: str, domain: TaskDomain) -> Dict[str, Any]:
        """
        Extract specific entities based on domain.
        """
        entities = {}

        # Extract emails
        emails = re.findall(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', request)
        if emails:
            entities["recipients"] = emails

        # Extract dates/times
        date_patterns = [
            (r'\b(today|tomorrow|tonight)\b', self._parse_relative_date),
            (r'\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b', self._parse_day_of_week),
            (r'\b(\d{1,2}:\d{2}\s*(?:am|pm)?)\b', self._parse_time),
        ]

        for pattern, parser in date_patterns:
            matches = re.findall(pattern, request, re.IGNORECASE)
            if matches:
                try:
                    parsed = parser(matches[0])
                    if "date" not in entities:
                        entities["date"] = parsed
                except:
                    pass

        # Extract money amounts
        money_pattern = r'\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)'
        amounts = re.findall(money_pattern, request)
        if amounts:
            entities["amount"] = float(amounts[0].replace(',', ''))

        # Extract URLs
        urls = re.findall(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', request)
        if urls:
            entities["urls"] = urls

        # Domain-specific extractions
        if domain == TaskDomain.SOCIAL_MEDIA:
            # Extract hashtags
            hashtags = re.findall(r'#\w+', request)
            if hashtags:
                entities["hashtags"] = hashtags

        if domain == TaskDomain.FILE_MANAGEMENT:
            # Extract file paths
            file_patterns = [
                r'([A-Za-z]:\\(?:[^\\/:*?"<>|\r\n]+\\)*[^\\/:*?"<>|\r\n]*)',  # Windows
                r'(/(?:[^/\s]+/)*[^/\s]+)',  # Unix
            ]
            for pattern in file_patterns:
                files = re.findall(pattern, request)
                if files:
                    entities["files"] = files
                    break

        return entities

    def _extract_constraints(self, request: str) -> List[str]:
        """
        Extract must-haves and limitations.
        """
        constraints = []

        # Deadline indicators
        deadline_patterns = [
            r'by\s+(today|tomorrow|friday|monday|tuesday|wednesday|thursday|saturday|sunday)',
            r'before\s+(\d{1,2}:\d{2})',
            r'within\s+(\d+)\s+(hour|day|week)',
            r'urgent',
            r'asap',
            r'immediately',
        ]

        for pattern in deadline_patterns:
            if re.search(pattern, request, re.IGNORECASE):
                match = re.search(pattern, request, re.IGNORECASE)
                if match:
                    constraints.append(f"Time constraint: {match.group(0)}")

        # Required actions
        if "must" in request.lower():
            must_items = re.findall(r'must\s+([^.!?]+)', request, re.IGNORECASE)
            constraints.extend([f"Must: {item.strip()}" for item in must_items])

        return constraints

    def _determine_resources(self, domain: TaskDomain, entities: Dict[str, Any]) -> List[str]:
        """
        Determine what resources/APIs are needed.
        """
        resources = []

        # Domain-based resources
        resource_map = {
            TaskDomain.EMAIL: ["gmail_api", "email_sender"],
            TaskDomain.CALENDAR: ["google_calendar_api"],
            TaskDomain.SOCIAL_MEDIA: ["linkedin_api", "twitter_api", "facebook_api"],
            TaskDomain.MUSIC: ["spotify_api"],
            TaskDomain.PAYMENT: ["payment_processor", "stripe_api"],
            TaskDomain.ERP: ["odoo_api"],
            TaskDomain.MOBILE_CONTROL: ["mobile_bridge", "android_adb"],
            TaskDomain.DESKTOP_CONTROL: ["desktop_bridge", "automation_tools"],
        }

        if domain in resource_map:
            resources.extend(resource_map[domain])

        # Entity-based resources
        if "recipients" in entities:
            if "gmail" not in " ".join(resources):
                resources.append("email_service")

        if "amount" in entities:
            if "payment" not in " ".join(resources):
                resources.append("payment_verification")

        return resources

    def _identify_ambiguities(self, request: str, entities: Dict[str, Any]) -> List[str]:
        """
        Identify unclear parts that need clarification.
        """
        ambiguities = []

        # Check for vague references
        vague_terms = ["that", "it", "this", "those", "thing", "stuff"]
        for term in vague_terms:
            if re.search(rf'\b{term}\b', request, re.IGNORECASE):
                ambiguities.append(f"Vague reference: '{term}' - what specifically?")

        # Check for missing critical info
        if "send" in request.lower() and "recipients" not in entities:
            ambiguities.append("No recipient specified - send to whom?")

        if "schedule" in request.lower() or "meeting" in request.lower():
            if "date" not in entities:
                ambiguities.append("No date specified - when should it be scheduled?")

        if "payment" in request.lower() or "pay" in request.lower():
            if "amount" not in entities:
                ambiguities.append("No amount specified - how much?")
            if "recipients" not in entities:
                ambiguities.append("No payee specified - pay whom?")

        return ambiguities

    def _parse_relative_date(self, date_str: str) -> str:
        """Parse relative dates like 'today', 'tomorrow'."""
        date_str = date_str.lower()
        today = datetime.now()

        if date_str == "today" or date_str == "tonight":
            return today.strftime("%Y-%m-%d")
        elif date_str == "tomorrow":
            return (today + timedelta(days=1)).strftime("%Y-%m-%d")

        return today.strftime("%Y-%m-%d")

    def _parse_day_of_week(self, day_str: str) -> str:
        """Parse day of week to next occurrence."""
        days = {
            "monday": 0, "tuesday": 1, "wednesday": 2, "thursday": 3,
            "friday": 4, "saturday": 5, "sunday": 6
        }

        day_str = day_str.lower()
        if day_str not in days:
            return datetime.now().strftime("%Y-%m-%d")

        today = datetime.now()
        target_day = days[day_str]
        current_day = today.weekday()

        # Calculate days until target
        days_ahead = target_day - current_day
        if days_ahead <= 0:  # Target day already happened this week
            days_ahead += 7

        target_date = today + timedelta(days=days_ahead)
        return target_date.strftime("%Y-%m-%d")

    def _parse_time(self, time_str: str) -> str:
        """Parse time string to 24-hour format."""
        # This is a simple version, can be enhanced
        return time_str

    def _calculate_confidence(self, entities: Dict[str, Any], ambiguities: List[str]) -> float:
        """
        Calculate confidence in the analysis.

        Returns:
            Float between 0-1
        """
        confidence = 1.0

        # Reduce confidence for each ambiguity
        confidence -= len(ambiguities) * 0.15

        # Reduce confidence if very few entities extracted
        if len(entities) < 2:
            confidence -= 0.1

        # Ensure minimum confidence
        return max(confidence, 0.1)

    async def _find_similar_tasks(self, intent: str, domain: TaskDomain, limit: int = 5) -> List[str]:
        """
        Find similar past tasks from history database.

        Args:
            intent: Task intent
            domain: Task domain
            limit: Maximum number of similar tasks to return

        Returns:
            List of task IDs
        """
        if not self.history:
            return []

        try:
            similar = await self.history.find_similar(
                intent=intent,
                domain=domain.value,
                limit=limit
            )
            return similar
        except Exception as e:
            print(f"Error finding similar tasks: {e}")
            return []
