# Agentic Intelligence Layer Specification

**Version:** 1.0
**Date:** 2026-01-23
**Status:** Ready for Implementation
**Priority:** P0 (Critical - Foundation for all features)

---

## Overview

The **Agentic Intelligence Layer** is the brain that makes Abdullah Junior truly autonomous. It decides:
1. **When to plan vs execute**: Should I create a spec or just do it?
2. **Task complexity**: How hard is this task?
3. **Risk assessment**: What could go wrong?
4. **Proactive actions**: Should I suggest this without being asked?

This layer transforms the agent from a reactive executor into a proactive, intelligent assistant.

---

## The Core Problem

Current state:
- User says: "Send email to client about the proposal"
  - Agent: Creates task → User approves → Sends email ✅ Simple, works well

- User says: "Build a comprehensive sales pipeline in Odoo"
  - Agent: Tries to do it immediately → Makes mistakes → User frustrated ❌

**We need intelligence to know the difference.**

---

## The Solution: 3-Layer Intelligence

```
┌─────────────────────────────────────────────────────────────┐
│                    USER REQUEST                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│   LAYER 1: Task Analysis (What am I being asked?)           │
│   • Extract intent, entities, constraints                   │
│   • Identify required resources                             │
│   • Classify domain (email, calendar, code, etc.)           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│   LAYER 2: Complexity & Risk Scoring (How hard/risky?)      │
│   • Complexity: 0-1 (simple to complex)                     │
│   • Risk: 0-1 (safe to dangerous)                           │
│   • Estimated steps: 1-N                                    │
│   • Dependencies: internal vs external                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│   LAYER 3: Decision Making (What should I do?)              │
│   • Direct execution (simple, safe)                         │
│   • Spec-driven (complex, risky)                            │
│   • Clarification needed (ambiguous)                        │
│   • Proactive suggestion (anticipate need)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                   ┌─────┴─────┐
                   │           │
                   ▼           ▼
            ┌──────────┐  ┌─────────────┐
            │ Execute  │  │ Create Spec │
            │ Directly │  │ Then Execute│
            └──────────┘  └─────────────┘
```

---

## Technical Design

### Layer 1: Task Analysis

```python
# src/intelligence/task_analyzer.py

from dataclasses import dataclass
from typing import List, Dict, Optional
from enum import Enum

class TaskDomain(Enum):
    """Task category."""
    EMAIL = "email"
    CALENDAR = "calendar"
    SOCIAL_MEDIA = "social"
    FILE_MANAGEMENT = "file"
    CODE = "code"
    AUTOMATION = "automation"
    RESEARCH = "research"
    MOBILE_CONTROL = "mobile"
    DESKTOP_CONTROL = "desktop"
    MUSIC = "music"
    PAYMENT = "payment"
    ERP = "erp"
    GENERAL = "general"

@dataclass
class TaskAnalysisResult:
    """Result of task analysis."""
    intent: str  # What user wants in one sentence
    domain: TaskDomain
    entities: Dict[str, Any]  # Extracted: recipients, dates, amounts, etc.
    constraints: List[str]  # Must-haves and limitations
    required_resources: List[str]  # APIs, files, credentials needed
    ambiguities: List[str]  # Unclear parts needing clarification
    similar_past_tasks: List[str]  # IDs of similar tasks done before

class TaskAnalyzer:
    """Extract structured info from user request."""

    def __init__(self, ai_client, history_db):
        self.ai = ai_client
        self.history = history_db

    async def analyze(self, user_request: str) -> TaskAnalysisResult:
        """
        Analyze user request and extract structured information.

        Example:
        Input: "Send email to john@example.com about the Q1 report by Friday"
        Output:
          intent: "Send email with Q1 report"
          domain: TaskDomain.EMAIL
          entities: {
            "recipient": "john@example.com",
            "subject_topic": "Q1 report",
            "deadline": "2026-01-26" (Friday)
          }
          constraints: ["Must send by Friday"]
          required_resources: ["email_sender", "gmail_access"]
          ambiguities: []
        """

        # Use LLM to extract structured info
        prompt = self._build_analysis_prompt(user_request)
        response = await self.ai.complete(prompt)
        result = self._parse_analysis_response(response)

        # Find similar past tasks
        result.similar_past_tasks = await self.history.find_similar(
            intent=result.intent,
            domain=result.domain,
            limit=5
        )

        return result

    def _build_analysis_prompt(self, user_request: str) -> str:
        """Build prompt for task analysis."""
        return f"""Analyze this user request and extract structured information:

"{user_request}"

Provide:
1. Intent: What does the user want in one clear sentence?
2. Domain: Which category? (email, calendar, social, file, code, automation, research, mobile, desktop, music, payment, erp, general)
3. Entities: Extract specific values:
   - Recipients (emails, names)
   - Dates/times
   - Amounts (money, quantities)
   - Files/documents
   - URLs
   - Apps/services
4. Constraints: Must-haves and limitations
5. Required resources: What APIs/services/credentials are needed?
6. Ambiguities: What's unclear or needs clarification?

Respond in JSON format:
{{
  "intent": "...",
  "domain": "...",
  "entities": {{}},
  "constraints": [],
  "required_resources": [],
  "ambiguities": []
}}"""

    def _parse_analysis_response(self, response: str) -> TaskAnalysisResult:
        """Parse LLM response into TaskAnalysisResult."""
        # Implementation: Parse JSON, validate, create object
        ...
```

### Layer 2: Complexity & Risk Scoring

```python
# src/intelligence/complexity_scorer.py

@dataclass
class ComplexityScore:
    """Complexity assessment."""
    overall_score: float  # 0-1 (simple to complex)
    factors: Dict[str, float]  # Individual factor scores
    reasoning: List[str]  # Why this score?
    estimated_steps: int  # How many steps?
    estimated_time: str  # Human-readable estimate

@dataclass
class RiskScore:
    """Risk assessment."""
    overall_score: float  # 0-1 (safe to dangerous)
    factors: Dict[str, float]  # Individual risk factors
    reasoning: List[str]  # Why risky?
    reversible: bool  # Can it be undone?
    requires_approval: bool  # Per company handbook

class ComplexityScorer:
    """Score task complexity."""

    # Complexity factors and their weights
    COMPLEXITY_FACTORS = {
        'step_count': 0.25,        # More steps = more complex
        'external_dependencies': 0.20,  # External APIs = more complex
        'data_transformation': 0.15,    # Data processing = more complex
        'conditional_logic': 0.15,      # If/else branches = more complex
        'error_handling': 0.15,         # Edge cases = more complex
        'integration_count': 0.10,      # Multiple systems = more complex
    }

    # Risk factors and their weights
    RISK_FACTORS = {
        'financial_impact': 0.30,   # Money involved = high risk
        'external_comms': 0.25,     # Outside company = high risk
        'irreversible': 0.20,       # Can't undo = high risk
        'data_sensitivity': 0.15,   # PII/secrets = high risk
        'system_access': 0.10,      # Broad permissions = risk
    }

    def score_complexity(self, analysis: TaskAnalysisResult) -> ComplexityScore:
        """
        Calculate complexity score.

        Examples:
        - "Send email to John" → 0.2 (1 step, simple)
        - "Schedule meeting with 5 people" → 0.5 (multiple steps, external)
        - "Build sales pipeline in Odoo" → 0.9 (many steps, complex logic)
        """

        scores = {}

        # Step count estimation
        estimated_steps = self._estimate_steps(analysis)
        scores['step_count'] = min(estimated_steps / 10, 1.0)

        # External dependencies
        ext_deps = [r for r in analysis.required_resources if 'api' in r.lower()]
        scores['external_dependencies'] = min(len(ext_deps) / 3, 1.0)

        # Data transformation complexity
        has_data_transform = any(
            word in analysis.intent.lower()
            for word in ['transform', 'process', 'analyze', 'calculate', 'aggregate']
        )
        scores['data_transformation'] = 0.7 if has_data_transform else 0.2

        # Conditional logic
        has_conditions = any(
            word in analysis.intent.lower()
            for word in ['if', 'when', 'unless', 'depending', 'based on']
        )
        scores['conditional_logic'] = 0.6 if has_conditions else 0.1

        # Error handling needs
        scores['error_handling'] = min(len(analysis.ambiguities) / 5, 1.0)

        # Integration count
        scores['integration_count'] = min(len(analysis.required_resources) / 5, 1.0)

        # Weighted overall score
        overall = sum(
            scores[factor] * weight
            for factor, weight in self.COMPLEXITY_FACTORS.items()
        )

        reasoning = self._generate_complexity_reasoning(scores, estimated_steps)

        return ComplexityScore(
            overall_score=overall,
            factors=scores,
            reasoning=reasoning,
            estimated_steps=estimated_steps,
            estimated_time=self._estimate_time(estimated_steps)
        )

    def score_risk(
        self,
        analysis: TaskAnalysisResult,
        handbook_rules: Dict
    ) -> RiskScore:
        """
        Calculate risk score.

        Examples:
        - "Send email to colleague" → 0.2 (low risk, internal)
        - "Post on LinkedIn" → 0.5 (medium risk, public)
        - "Transfer $1000" → 0.9 (high risk, money)
        """

        scores = {}

        # Financial impact
        has_money = 'amount' in analysis.entities or analysis.domain == TaskDomain.PAYMENT
        if has_money:
            amount = analysis.entities.get('amount', 0)
            scores['financial_impact'] = min(amount / 1000, 1.0)
        else:
            scores['financial_impact'] = 0.0

        # External communications
        is_external = self._is_external_communication(analysis)
        scores['external_comms'] = 0.8 if is_external else 0.2

        # Reversibility
        irreversible_keywords = ['delete', 'remove', 'send', 'post', 'publish', 'pay', 'transfer']
        is_irreversible = any(kw in analysis.intent.lower() for kw in irreversible_keywords)
        scores['irreversible'] = 0.9 if is_irreversible else 0.3

        # Data sensitivity
        sensitive_data = any(
            word in analysis.intent.lower()
            for word in ['password', 'secret', 'credential', 'ssn', 'credit card']
        )
        scores['data_sensitivity'] = 0.95 if sensitive_data else 0.1

        # System access level
        requires_admin = any(
            'admin' in resource or 'root' in resource
            for resource in analysis.required_resources
        )
        scores['system_access'] = 0.8 if requires_admin else 0.2

        # Weighted overall score
        overall = sum(
            scores[factor] * weight
            for factor, weight in self.RISK_FACTORS.items()
        )

        # Check company handbook for approval rules
        requires_approval = self._check_approval_rules(analysis, handbook_rules, overall)

        reasoning = self._generate_risk_reasoning(scores, requires_approval)

        return RiskScore(
            overall_score=overall,
            factors=scores,
            reasoning=reasoning,
            reversible=not is_irreversible,
            requires_approval=requires_approval
        )

    def _estimate_steps(self, analysis: TaskAnalysisResult) -> int:
        """Estimate number of steps required."""
        base_steps = 1

        # Add steps for each resource
        base_steps += len(analysis.required_resources)

        # Add steps for constraints
        base_steps += len(analysis.constraints)

        # Add steps for external dependencies
        ext_deps = [r for r in analysis.required_resources if 'api' in r.lower()]
        base_steps += len(ext_deps) * 2  # External calls need setup + execute

        # Check past similar tasks
        if analysis.similar_past_tasks:
            # Average steps from similar tasks
            # (Implementation would fetch from DB)
            pass

        return max(base_steps, 1)

    def _estimate_time(self, steps: int) -> str:
        """Convert steps to human-readable time estimate."""
        if steps <= 2:
            return "< 1 minute"
        elif steps <= 5:
            return "1-3 minutes"
        elif steps <= 10:
            return "5-10 minutes"
        else:
            return "10+ minutes"
```

### Layer 3: Decision Making

```python
# src/intelligence/agentic_decision.py

class ApproachDecision(Enum):
    """What should the agent do?"""
    EXECUTE_DIRECTLY = "direct"      # Simple, safe → Just do it
    SPEC_DRIVEN = "spec"             # Complex, risky → Plan first
    CLARIFICATION_NEEDED = "clarify" # Ambiguous → Ask user
    PROACTIVE_SUGGEST = "suggest"    # Anticipate → Offer to help

@dataclass
class AgenticDecision:
    """Final decision on how to handle task."""
    approach: ApproachDecision
    confidence: float  # 0-1, how confident in this decision
    reasoning: List[str]  # Why this approach?
    complexity: ComplexityScore
    risk: RiskScore
    recommended_next_steps: List[str]
    approval_required: bool
    estimated_duration: str

class AgenticIntelligence:
    """
    Main intelligence layer - decides task approach.

    This is the core that makes the agent "agentic".
    """

    # Decision thresholds (tunable)
    THRESHOLDS = {
        'complexity_spec_required': 0.7,   # >= 0.7 → need spec
        'risk_spec_required': 0.6,         # >= 0.6 → need spec
        'min_confidence': 0.6,              # < 0.6 → ask for clarification
        'proactive_threshold': 0.8,         # >= 0.8 → suggest proactively
    }

    def __init__(self, config, history_db, handbook_rules):
        self.config = config
        self.analyzer = TaskAnalyzer(config.ai_client, history_db)
        self.complexity_scorer = ComplexityScorer()
        self.history = history_db

    async def decide(self, user_request: str) -> AgenticDecision:
        """
        Analyze request and decide approach.

        This is the main entry point.

        Examples:
        1. Simple: "Send email to John" → EXECUTE_DIRECTLY
        2. Complex: "Build Odoo sales pipeline" → SPEC_DRIVEN
        3. Ambiguous: "Handle that thing" → CLARIFICATION_NEEDED
        4. Proactive: User just got urgent email → PROACTIVE_SUGGEST
        """

        # Layer 1: Analyze task
        analysis = await self.analyzer.analyze(user_request)

        # Layer 2: Score complexity and risk
        complexity = self.complexity_scorer.score_complexity(analysis)
        risk = self.complexity_scorer.score_risk(
            analysis,
            self.config.handbook_rules
        )

        # Layer 3: Make decision
        approach = self._decide_approach(analysis, complexity, risk)
        confidence = self._calculate_confidence(analysis, complexity, risk)
        reasoning = self._build_reasoning(analysis, complexity, risk, approach)
        next_steps = self._recommend_next_steps(approach, analysis)

        return AgenticDecision(
            approach=approach,
            confidence=confidence,
            reasoning=reasoning,
            complexity=complexity,
            risk=risk,
            recommended_next_steps=next_steps,
            approval_required=risk.requires_approval,
            estimated_duration=complexity.estimated_time
        )

    def _decide_approach(
        self,
        analysis: TaskAnalysisResult,
        complexity: ComplexityScore,
        risk: RiskScore
    ) -> ApproachDecision:
        """Core decision logic."""

        # Check for ambiguities first
        if len(analysis.ambiguities) > 2:
            return ApproachDecision.CLARIFICATION_NEEDED

        # High complexity → need spec
        if complexity.overall_score >= self.THRESHOLDS['complexity_spec_required']:
            return ApproachDecision.SPEC_DRIVEN

        # High risk → need spec
        if risk.overall_score >= self.THRESHOLDS['risk_spec_required']:
            return ApproachDecision.SPEC_DRIVEN

        # Many steps → need spec
        if complexity.estimated_steps >= 5:
            return ApproachDecision.SPEC_DRIVEN

        # External communications → need spec (unless simple)
        if risk.factors.get('external_comms', 0) >= 0.7 and complexity.overall_score >= 0.4:
            return ApproachDecision.SPEC_DRIVEN

        # Financial transactions → always spec
        if risk.factors.get('financial_impact', 0) > 0:
            return ApproachDecision.SPEC_DRIVEN

        # Otherwise, execute directly
        return ApproachDecision.EXECUTE_DIRECTLY

    def _calculate_confidence(
        self,
        analysis: TaskAnalysisResult,
        complexity: ComplexityScore,
        risk: RiskScore
    ) -> float:
        """How confident are we in this decision?"""

        confidence = 1.0

        # Reduce confidence for ambiguities
        confidence -= len(analysis.ambiguities) * 0.15

        # Reduce confidence for high complexity/risk mismatch
        if complexity.overall_score > 0.8 and risk.overall_score < 0.3:
            confidence -= 0.2  # Complex but low risk is unusual

        # Reduce confidence if no similar past tasks
        if not analysis.similar_past_tasks:
            confidence -= 0.1

        return max(confidence, 0.1)

    def _build_reasoning(
        self,
        analysis: TaskAnalysisResult,
        complexity: ComplexityScore,
        risk: RiskScore,
        approach: ApproachDecision
    ) -> List[str]:
        """Explain decision to user."""

        reasons = []

        if approach == ApproachDecision.EXECUTE_DIRECTLY:
            reasons.append(f"Task is simple ({complexity.overall_score:.1f} complexity)")
            reasons.append(f"Low risk ({risk.overall_score:.1f} risk score)")
            reasons.append(f"Estimated {complexity.estimated_steps} steps")
            reasons.append("Can execute immediately")

        elif approach == ApproachDecision.SPEC_DRIVEN:
            if complexity.overall_score >= 0.7:
                reasons.append(f"High complexity ({complexity.overall_score:.1f})")
            if risk.overall_score >= 0.6:
                reasons.append(f"Significant risk ({risk.overall_score:.1f})")
            if complexity.estimated_steps >= 5:
                reasons.append(f"Multi-step task ({complexity.estimated_steps} steps)")
            reasons.append("Creating detailed spec for safety and quality")

        elif approach == ApproachDecision.CLARIFICATION_NEEDED:
            reasons.append(f"Found {len(analysis.ambiguities)} ambiguities:")
            reasons.extend(f"  - {amb}" for amb in analysis.ambiguities[:3])

        return reasons
```

---

## Proactive Intelligence

Beyond reactive responses, the agent should *anticipate* user needs:

```python
# src/intelligence/proactive_suggestions.py

class ProactiveSuggestor:
    """Suggests actions before being asked."""

    async def check_for_suggestions(self) -> List[ProactiveSuggestion]:
        """
        Scan context and suggest helpful actions.

        Examples:
        1. Urgent email received → Suggest "Reply to urgent email from client?"
        2. Meeting in 10 minutes → Suggest "Prepare meeting notes?"
        3. No social post in 3 days → Suggest "Create LinkedIn post?"
        4. Low Spotify energy → Suggest "Play energetic music?"
        """

        suggestions = []

        # Check recent emails
        urgent_emails = await self._check_urgent_emails()
        if urgent_emails:
            suggestions.append(
                ProactiveSuggestion(
                    title="Urgent email needs attention",
                    description=f"Email from {urgent_emails[0].sender} marked urgent",
                    action="Reply to urgent email?",
                    priority="high",
                    action_id="reply_urgent_email",
                    context={"email_id": urgent_emails[0].id}
                )
            )

        # Check calendar
        upcoming_meetings = await self._check_upcoming_meetings()
        for meeting in upcoming_meetings:
            if meeting.starts_in_minutes <= 15:
                suggestions.append(
                    ProactiveSuggestion(
                        title=f"Meeting in {meeting.starts_in_minutes} minutes",
                        description=meeting.title,
                        action="Prepare meeting notes?",
                        priority="medium",
                        action_id="prepare_meeting_notes",
                        context={"meeting_id": meeting.id}
                    )
                )

        # Check social media activity
        days_since_post = await self._days_since_social_post()
        if days_since_post >= 3:
            suggestions.append(
                ProactiveSuggestion(
                    title="Time for a social post?",
                    description=f"Last LinkedIn post was {days_since_post} days ago",
                    action="Generate LinkedIn post?",
                    priority="low",
                    action_id="generate_social_post"
                )
            )

        # Check Spotify context (if playing)
        spotify_context = await self._get_spotify_context()
        if spotify_context and spotify_context.energy_level < 0.3:
            if self._is_working_hours():
                suggestions.append(
                    ProactiveSuggestion(
                        title="Need an energy boost?",
                        description="Current music is low-energy during work hours",
                        action="Switch to focus playlist?",
                        priority="low",
                        action_id="play_focus_music"
                    )
                )

        return suggestions
```

---

## Integration with Workflow

```python
# src/orchestrator.py (modified)

async def process_user_request(request: str):
    """Main orchestrator flow with agentic intelligence."""

    # Use agentic intelligence to analyze
    intelligence = AgenticIntelligence(config, history_db, handbook)
    decision = await intelligence.decide(request)

    # Log decision
    log_audit("AGENTIC_DECISION", {
        "request": request,
        "approach": decision.approach.value,
        "complexity": decision.complexity.overall_score,
        "risk": decision.risk.overall_score,
        "confidence": decision.confidence,
        "reasoning": decision.reasoning
    })

    # Take action based on decision
    if decision.approach == ApproachDecision.CLARIFICATION_NEEDED:
        # Ask user for clarification
        await ask_user_clarification(decision.reasoning)

    elif decision.approach == ApproachDecision.EXECUTE_DIRECTLY:
        # Just do it
        notify_user(f"Executing task (complexity: {decision.complexity.overall_score:.2f})")
        await execute_task_directly(request, decision)

    elif decision.approach == ApproachDecision.SPEC_DRIVEN:
        # Create spec first
        notify_user(f"Complex task detected - creating detailed spec first")
        spec = await generate_spec(request, decision)
        await present_spec_for_approval(spec)
        # After approval, execute from spec

    elif decision.approach == ApproachDecision.PROACTIVE_SUGGEST:
        # Offer suggestion
        await suggest_action(decision)
```

---

## Acceptance Criteria

- [ ] Task analysis extracts intent, domain, entities correctly (>90% accuracy)
- [ ] Complexity scoring aligns with human judgment (tested on 100 tasks)
- [ ] Risk scoring identifies high-risk tasks (100% on payment/external comms)
- [ ] Simple tasks execute directly (latency < 5 sec)
- [ ] Complex tasks create specs (no accidental direct execution)
- [ ] Ambiguous tasks ask for clarification
- [ ] Proactive suggestions are helpful, not annoying (user feedback > 4/5)
- [ ] Decision reasoning is clear and understandable
- [ ] All decisions logged for auditability

---

## Testing Plan

```python
# tests/test_agentic_intelligence.py

def test_simple_task_direct_execution():
    """Simple tasks should execute directly."""
    request = "Send email to john@example.com saying hello"
    decision = await intelligence.decide(request)
    assert decision.approach == ApproachDecision.EXECUTE_DIRECTLY
    assert decision.complexity.overall_score < 0.5

def test_complex_task_spec_driven():
    """Complex tasks should use spec-driven approach."""
    request = "Build a multi-step sales pipeline in Odoo with automated follow-ups"
    decision = await intelligence.decide(request)
    assert decision.approach == ApproachDecision.SPEC_DRIVEN
    assert decision.complexity.overall_score >= 0.7

def test_risky_task_spec_driven():
    """Risky tasks should use spec-driven approach."""
    request = "Transfer $5000 to vendor account"
    decision = await intelligence.decide(request)
    assert decision.approach == ApproachDecision.SPEC_DRIVEN
    assert decision.risk.overall_score >= 0.6

def test_ambiguous_task_clarification():
    """Ambiguous tasks should ask for clarification."""
    request = "Handle that thing we discussed"
    decision = await intelligence.decide(request)
    assert decision.approach == ApproachDecision.CLARIFICATION_NEEDED

def test_proactive_suggestion_urgent_email():
    """Should suggest action for urgent email."""
    # Simulate urgent email arrival
    await simulate_email(from="client@example.com", subject="URGENT: Issue", priority="high")
    suggestions = await suggestor.check_for_suggestions()
    assert any("urgent email" in s.title.lower() for s in suggestions)
```

---

**Next:** This Agentic Intelligence Layer will be the foundation for all agent enhancements. It gets implemented first in Phase 3 (Week 3, Day 1-2).
