from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass
class BraidResult:
    braid: str
    summary: str
    findings: list[str]
    risks: list[str]
    confidence: float
    metadata: dict[str, Any]


class BraidNode:
    name = "base"

    def process(self, user_input: str, context: dict[str, Any] | None = None) -> BraidResult:
        raise NotImplementedError
