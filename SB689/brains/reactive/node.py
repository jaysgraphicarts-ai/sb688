from __future__ import annotations

from typing import Any

from brains.base import BraidNode, BraidResult


class ReactiveBraid(BraidNode):
    name = "reactive"

    def process(self, user_input: str, context: dict[str, Any] | None = None) -> BraidResult:
        text = user_input.strip()
        risk_words = ["delete", "secret", "password", "key", "payment", "legal", "medical", "weapon", "private"]
        risks = [f"Risk word detected: {word}" for word in risk_words if word in text.lower()]
        findings = [
            "Fast-path scan completed.",
            "Input received and checked for immediate risk markers.",
        ]
        summary = "Reactive braid found immediate risk markers." if risks else "Reactive braid found no immediate high-risk marker."
        confidence = 0.78 if risks else 0.72
        return BraidResult(
            braid=self.name,
            summary=summary,
            findings=findings,
            risks=risks,
            confidence=confidence,
            metadata={"length": len(text), "risk_marker_count": len(risks)},
        )
