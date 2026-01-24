"""
Complexity and Risk Scorer - Layer 2 of Agentic Intelligence.
Scores task complexity and risk to inform decision making.
"""

from typing import Dict, List
from src.models.enhancements.task_analysis import (
    ComplexityScore,
    RiskScore,
    TaskAnalysisResult,
    TaskDomain
)


class ComplexityScorer:
    """
    Score task complexity and risk.

    This is Layer 2 of the Agentic Intelligence system.
    """

    # Complexity factors and their weights
    COMPLEXITY_FACTORS = {
        'step_count': 0.25,            # More steps = more complex
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

    def __init__(self, handbook_rules: Dict = None):
        """
        Initialize scorer.

        Args:
            handbook_rules: Company handbook rules for approval decisions
        """
        self.handbook_rules = handbook_rules or {}

    def score_complexity(self, analysis: TaskAnalysisResult) -> ComplexityScore:
        """
        Calculate complexity score.

        Examples:
            - "Send email to John" → 0.2 (1 step, simple)
            - "Schedule meeting with 5 people" → 0.5 (multiple steps, external)
            - "Build sales pipeline in Odoo" → 0.9 (many steps, complex logic)

        Args:
            analysis: Task analysis result

        Returns:
            ComplexityScore with 0-1 overall score and reasoning
        """
        scores = {}

        # 1. Step count estimation
        estimated_steps = self._estimate_steps(analysis)
        scores['step_count'] = min(estimated_steps / 10, 1.0)

        # 2. External dependencies
        ext_deps = [r for r in analysis.required_resources if 'api' in r.lower()]
        scores['external_dependencies'] = min(len(ext_deps) / 3, 1.0)

        # 3. Data transformation complexity
        has_data_transform = any(
            word in analysis.intent.lower()
            for word in ['transform', 'process', 'analyze', 'calculate', 'aggregate', 'generate']
        )
        scores['data_transformation'] = 0.7 if has_data_transform else 0.2

        # 4. Conditional logic
        has_conditions = any(
            word in analysis.intent.lower()
            for word in ['if', 'when', 'unless', 'depending', 'based on', 'only if']
        )
        scores['conditional_logic'] = 0.6 if has_conditions else 0.1

        # 5. Error handling needs
        scores['error_handling'] = min(len(analysis.ambiguities) / 5, 1.0)

        # 6. Integration count
        scores['integration_count'] = min(len(analysis.required_resources) / 5, 1.0)

        # Calculate weighted overall score
        overall = sum(
            scores[factor] * weight
            for factor, weight in self.COMPLEXITY_FACTORS.items()
        )

        # Generate reasoning
        reasoning = self._generate_complexity_reasoning(scores, estimated_steps)

        # Estimate time
        estimated_time = self._estimate_time(estimated_steps, overall)

        return ComplexityScore(
            overall_score=overall,
            factors=scores,
            reasoning=reasoning,
            estimated_steps=estimated_steps,
            estimated_time=estimated_time
        )

    def score_risk(
        self,
        analysis: TaskAnalysisResult,
        handbook_rules: Dict = None
    ) -> RiskScore:
        """
        Calculate risk score.

        Examples:
            - "Send email to colleague" → 0.2 (low risk, internal)
            - "Post on LinkedIn" → 0.5 (medium risk, public)
            - "Transfer $1000" → 0.9 (high risk, money)

        Args:
            analysis: Task analysis result
            handbook_rules: Optional company handbook rules

        Returns:
            RiskScore with 0-1 overall score and reasoning
        """
        scores = {}
        rules = handbook_rules or self.handbook_rules

        # 1. Financial impact
        has_money = 'amount' in analysis.entities or analysis.domain == TaskDomain.PAYMENT
        if has_money:
            amount = analysis.entities.get('amount', 0)
            # Risk increases with amount: $0-$100 (0.3), $100-$500 (0.6), $500+ (0.9+)
            if amount == 0:
                scores['financial_impact'] = 0.3
            elif amount < 100:
                scores['financial_impact'] = 0.5
            elif amount < 500:
                scores['financial_impact'] = 0.7
            else:
                scores['financial_impact'] = min(0.9 + (amount / 10000), 1.0)
        else:
            scores['financial_impact'] = 0.0

        # 2. External communications
        is_external = self._is_external_communication(analysis)
        scores['external_comms'] = 0.8 if is_external else 0.2

        # 3. Reversibility
        irreversible_keywords = [
            'delete', 'remove', 'send', 'post', 'publish', 'pay',
            'transfer', 'drop', 'destroy', 'cancel'
        ]
        is_irreversible = any(
            kw in analysis.intent.lower()
            for kw in irreversible_keywords
        )
        scores['irreversible'] = 0.9 if is_irreversible else 0.3

        # 4. Data sensitivity
        sensitive_keywords = [
            'password', 'secret', 'credential', 'token', 'key',
            'ssn', 'social security', 'credit card', 'private', 'confidential'
        ]
        has_sensitive_data = any(
            word in analysis.intent.lower()
            for word in sensitive_keywords
        )
        scores['data_sensitivity'] = 0.95 if has_sensitive_data else 0.1

        # 5. System access level
        requires_admin = any(
            'admin' in resource or 'root' in resource or 'system' in resource
            for resource in analysis.required_resources
        )
        scores['system_access'] = 0.8 if requires_admin else 0.2

        # Calculate weighted overall score
        overall = sum(
            scores[factor] * weight
            for factor, weight in self.RISK_FACTORS.items()
        )

        # Check company handbook for approval rules
        requires_approval = self._check_approval_rules(analysis, rules, overall)

        # Generate reasoning
        reasoning = self._generate_risk_reasoning(scores, requires_approval)

        return RiskScore(
            overall_score=overall,
            factors=scores,
            reasoning=reasoning,
            reversible=not is_irreversible,
            requires_approval=requires_approval
        )

    def _estimate_steps(self, analysis: TaskAnalysisResult) -> int:
        """
        Estimate number of steps required.

        Args:
            analysis: Task analysis result

        Returns:
            Estimated number of steps (1-20+)
        """
        base_steps = 1

        # Add steps for each resource
        base_steps += len(analysis.required_resources)

        # Add steps for constraints
        base_steps += len(analysis.constraints)

        # Add steps for external dependencies
        ext_deps = [r for r in analysis.required_resources if 'api' in r.lower()]
        base_steps += len(ext_deps) * 2  # External calls need setup + execute

        # Add steps based on domain complexity
        complex_domains = [
            TaskDomain.CODE,
            TaskDomain.AUTOMATION,
            TaskDomain.ERP
        ]
        if analysis.domain in complex_domains:
            base_steps += 3

        # Add steps if data transformation involved
        if any(word in analysis.intent.lower() for word in ['generate', 'create', 'build', 'analyze']):
            base_steps += 2

        return min(base_steps, 20)  # Cap at 20

    def _estimate_time(self, steps: int, complexity: float) -> str:
        """
        Convert steps and complexity to human-readable time estimate.

        Args:
            steps: Estimated steps
            complexity: Overall complexity score

        Returns:
            Human-readable time estimate
        """
        # Base time per step (in seconds)
        base_time = 30

        # Adjust for complexity
        time_seconds = steps * base_time * (1 + complexity)

        if time_seconds < 60:
            return "< 1 minute"
        elif time_seconds < 180:
            return "1-3 minutes"
        elif time_seconds < 600:
            return "5-10 minutes"
        elif time_seconds < 1800:
            return "10-30 minutes"
        else:
            return "30+ minutes"

    def _is_external_communication(self, analysis: TaskAnalysisResult) -> bool:
        """
        Check if task involves external communication.

        Args:
            analysis: Task analysis result

        Returns:
            True if external communication involved
        """
        # Check domain
        if analysis.domain in [TaskDomain.EMAIL, TaskDomain.SOCIAL_MEDIA]:
            # Check if recipients are external
            recipients = analysis.entities.get('recipients', [])
            if recipients:
                # Simple heuristic: if no internal domain specified, assume external
                # In production, this would check against company domain list
                return True

        # Check for social media keywords
        social_keywords = ['post', 'tweet', 'publish', 'share', 'linkedin', 'facebook']
        if any(kw in analysis.intent.lower() for kw in social_keywords):
            return True

        return False

    def _check_approval_rules(
        self,
        analysis: TaskAnalysisResult,
        handbook_rules: Dict,
        risk_score: float
    ) -> bool:
        """
        Check if task requires approval per company handbook.

        Args:
            analysis: Task analysis result
            handbook_rules: Company handbook rules
            risk_score: Calculated risk score

        Returns:
            True if approval required
        """
        # High risk always requires approval
        if risk_score >= 0.7:
            return True

        # Financial transactions over threshold
        if 'amount' in analysis.entities:
            threshold = handbook_rules.get('auto_approve_max_amount', 100)
            if analysis.entities['amount'] > threshold:
                return True

        # External communications
        if self._is_external_communication(analysis):
            return True

        # Sensitive data handling
        if any(
            word in analysis.intent.lower()
            for word in ['password', 'secret', 'credential', 'private']
        ):
            return True

        # System-level operations
        if any(
            'admin' in r or 'system' in r
            for r in analysis.required_resources
        ):
            return True

        return False

    def _generate_complexity_reasoning(
        self,
        scores: Dict[str, float],
        steps: int
    ) -> List[str]:
        """Generate human-readable reasoning for complexity score."""
        reasoning = []

        if steps <= 2:
            reasoning.append(f"Simple task with only {steps} step(s)")
        elif steps <= 5:
            reasoning.append(f"Moderate complexity with {steps} steps")
        else:
            reasoning.append(f"Complex task requiring {steps} steps")

        # Highlight high-scoring factors
        for factor, score in scores.items():
            if score >= 0.6:
                factor_name = factor.replace('_', ' ').title()
                reasoning.append(f"High {factor_name} ({score:.1f})")

        return reasoning

    def _generate_risk_reasoning(
        self,
        scores: Dict[str, float],
        requires_approval: bool
    ) -> List[str]:
        """Generate human-readable reasoning for risk score."""
        reasoning = []

        # Highlight high-risk factors
        high_risk_factors = []
        for factor, score in scores.items():
            if score >= 0.7:
                factor_name = factor.replace('_', ' ').title()
                high_risk_factors.append(f"{factor_name} ({score:.1f})")

        if high_risk_factors:
            reasoning.append("High risk factors: " + ", ".join(high_risk_factors))
        else:
            reasoning.append("Low overall risk")

        if requires_approval:
            reasoning.append("Requires user approval per company policy")

        # Check for specific risk types
        if scores.get('financial_impact', 0) > 0:
            reasoning.append("Involves financial transaction")

        if scores.get('irreversible', 0) >= 0.7:
            reasoning.append("Action is irreversible")

        if scores.get('external_comms', 0) >= 0.7:
            reasoning.append("Involves external communication")

        return reasoning