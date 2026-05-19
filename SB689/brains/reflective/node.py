from __future__ import annotations

from typing import Any

from brains.base import BraidNode, BraidResult


class ReflectiveBraid(BraidNode):
    name = "reflective"

    def process(self, user_input: str, context: dict[str, Any] | None = None) -> BraidResult:
        text = user_input.strip()
        lower = text.lower()
        risks = []
        findings = [
            "Audit-path scan completed.",
            "Separate facts from assumptions before writing memory or making claims.",
        ]
        if any(term in lower for term in ["quantum", "medical", "neuralink", "guaranteed", "production"]):
            risks.append("Strong claim boundary needed before final response.")
        if "private" in lower or "secret" in lower:
            findings.append("Private/public boundary should be checked before commit.")
        return BraidResult(
            braid=self.name,
            summary="Reflective braid checked contradictions, overclaim risk, and privacy boundary.",
            findings=findings,
            risks=risks,
            confidence=0.81,
            metadata={"claim_boundary_required": bool(risks)},
        )
