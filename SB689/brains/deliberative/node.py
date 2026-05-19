from __future__ import annotations

from typing import Any

from brains.base import BraidNode, BraidResult


class DeliberativeBraid(BraidNode):
    name = "deliberative"

    def process(self, user_input: str, context: dict[str, Any] | None = None) -> BraidResult:
        text = user_input.strip()
        findings = [
            "Planning-path scan completed.",
            "Input should be broken into goal, constraints, actions, verification, and next step.",
        ]
        if len(text) > 180:
            findings.append("Input contains enough detail for multi-step planning.")
        else:
            findings.append("Input is short; ask fewer assumptions and keep output bounded.")
        risks = []
        if "guarantee" in text.lower() or "100%" in text.lower():
            risks.append("Potential overclaim detected; VERA claim boundary should be applied.")
        return BraidResult(
            braid=self.name,
            summary="Deliberative braid produced a planning and constraint view.",
            findings=findings,
            risks=risks,
            confidence=0.76,
            metadata={"planning_needed": True},
        )
