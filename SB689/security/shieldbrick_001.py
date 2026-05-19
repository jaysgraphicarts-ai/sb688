from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any


@dataclass
class ShieldDecision:
    brick_id: str
    state: str
    allowed: bool
    human_approval_required: bool
    triggered_modules: list[str]
    blocks: list[str]
    notes: list[str]
    metadata: dict[str, Any]


class ShieldBrick001:
    """Defensive SHIELDBRICK-001 guard clipped onto SB689 STITCH processing.

    This is a public-safe local guard. It does not replace legal counsel,
    cybersecurity professionals, official policy, court process, or command authority.
    """

    brick_id = "SHIELDBRICK-001"

    IRONWALL_BLOCKS = {
        "unauthorized access": ["bypass login", "steal token", "hack account", "break into"],
        "ransomware behavior": ["encrypt files for ransom", "ransomware", "lock their files"],
        "evidence tampering": ["alter evidence", "delete evidence", "hide evidence", "change logs"],
        "prompt injection": ["ignore previous instructions", "reveal hidden prompt", "system prompt"],
        "token leakage": ["service role key", "api key", "password", "secret token"],
        "unsafe export": ["export private", "dump database", "leak customer"],
    }

    SOCIAL_BLOCKS = {
        "active suspect claims": ["suspect is", "active suspect", "wanted for"],
        "undercover information": ["undercover", "confidential informant", "ci name"],
        "sealed evidence": ["sealed evidence", "sealed record"],
        "juvenile data": ["juvenile", "minor victim", "child record"],
        "fake endorsements": ["fake endorsement", "pretend they endorsed"],
        "deceptive impersonation": ["impersonate", "pretend to be officer", "fake account as"],
    }

    def inspect(self, text: str, context: dict[str, Any] | None = None) -> dict[str, Any]:
        context = context or {}
        lower = text.lower()
        blocks: list[str] = []
        modules: list[str] = []
        notes: list[str] = []

        for block_name, markers in self.IRONWALL_BLOCKS.items():
            if any(marker in lower for marker in markers):
                blocks.append(block_name)
                if "ironwall_braid" not in modules:
                    modules.append("ironwall_braid")

        is_public_comm = bool(context.get("public_communication")) or any(
            marker in lower for marker in ["post", "publish", "facebook", "press release", "social media"]
        )
        if is_public_comm:
            modules.append("social_command_braid")
            for block_name, markers in self.SOCIAL_BLOCKS.items():
                if any(marker in lower for marker in markers):
                    blocks.append(block_name)

        sensitive_markers = ["legal", "policy", "county", "constitutional", "evidence", "juvenile", "private", "sealed"]
        if any(marker in lower for marker in sensitive_markers):
            modules.append("lawlock_braid")
            notes.append("Sensitive state defaults to YELLOW until approved.")

        if any(marker in lower for marker in ["save money", "cost", "budget", "waste", "savings"]):
            modules.append("money_saver_braid")
            notes.append("Money Saver output must remain estimated savings only.")

        if any(marker in lower for marker in ["idea", "plan", "strategy", "operation"]):
            modules.append("idea_forge_ai")
            notes.append("Idea Forge output requires LawLock check before action.")

        state = "GREEN"
        approval = False
        allowed = True

        if blocks:
            state = "RED"
            approval = True
            allowed = False
        elif "lawlock_braid" in modules or "social_command_braid" in modules:
            state = "YELLOW"
            approval = True
            allowed = True

        if not modules:
            modules.append("audit_ledger")
        else:
            modules.append("audit_ledger")

        decision = ShieldDecision(
            brick_id=self.brick_id,
            state=state,
            allowed=allowed,
            human_approval_required=approval,
            triggered_modules=sorted(set(modules)),
            blocks=sorted(set(blocks)),
            notes=notes,
            metadata={
                "default_sensitive_state": "YELLOW",
                "blocked_state": "RED",
                "mode": "defensive_governance_guard",
            },
        )
        return asdict(decision)
