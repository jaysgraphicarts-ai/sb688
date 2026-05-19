from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any


@dataclass
class AVADecision:
    brick_id: str
    state: str
    can_draft: bool
    approval_required: bool
    routed_brick: str | None
    draft_type: str
    blocked_reason: str | None
    notes: list[str]
    metadata: dict[str, Any]


class AVABrick001:
    """AVA business operator brick clipped behind CLIPPERX.

    AVA only operates when CLIPPERX reports a LIVE_ROOM and SHIELDBRICK does not block the action.
    """

    brick_id = "AVABRICK-001"

    ROUTES = {
        "music": "music_brick",
        "song": "music_brick",
        "release": "music_brick",
        "merch": "content_brick",
        "sales": "sales_brick",
        "lead": "sales_brick",
        "brand": "brand_brick",
        "logo": "brand_brick",
        "caption": "content_brick",
        "post": "content_brick",
        "booking": "booking_brick",
        "appointment": "booking_brick",
        "support": "support_brick",
        "customer": "support_brick",
        "ledger": "ledger_brick",
        "verify": "vera_brick",
    }

    def inspect(self, text: str, clipperx_decision: dict[str, Any], shield_decision: dict[str, Any], context: dict[str, Any] | None = None) -> dict[str, Any]:
        context = context or {}
        lower = text.lower()
        approved_bricks = set(clipperx_decision.get("loaded_bricks", []))
        notes: list[str] = []

        if clipperx_decision.get("state") != "LIVE_ROOM":
            decision = AVADecision(
                brick_id=self.brick_id,
                state="ROOM_LOCKED",
                can_draft=False,
                approval_required=False,
                routed_brick=None,
                draft_type="none",
                blocked_reason="CLIPPERX has not opened a verified LIVE_ROOM.",
                notes=["AVA is locked until room, key, Memory Chip, approved bricks, and STITCH handshake pass."],
                metadata={"mode": "business_operator_guard"},
            )
            return asdict(decision)

        if shield_decision.get("state") == "RED":
            decision = AVADecision(
                brick_id=self.brick_id,
                state="APPROVAL_REQUIRED",
                can_draft=False,
                approval_required=True,
                routed_brick=None,
                draft_type="blocked",
                blocked_reason="SHIELDBRICK-001 blocked the action.",
                notes=["Human/legal/security review required before AVA may continue."],
                metadata={"mode": "business_operator_guard"},
            )
            return asdict(decision)

        routed = self._route(lower)
        if routed and routed not in approved_bricks:
            notes.append(f"Requested task maps to {routed}, but that brick is not approved for this room.")
            decision = AVADecision(
                brick_id=self.brick_id,
                state="APPROVAL_REQUIRED",
                can_draft=False,
                approval_required=True,
                routed_brick=routed,
                draft_type="none",
                blocked_reason="Requested routed brick is not approved for this business room.",
                notes=notes,
                metadata={"approved_bricks": sorted(approved_bricks), "mode": "business_operator_guard"},
            )
            return asdict(decision)

        approval_required = bool(shield_decision.get("human_approval_required"))
        state = "APPROVAL_REQUIRED" if approval_required else "DRAFTING"
        draft_type = self._draft_type(lower)
        if not routed and approved_bricks:
            routed = sorted(approved_bricks)[0]
        notes.append("AVA may draft bounded output inside verified room." if not approval_required else "AVA may draft only as approval-prep; do not commit externally.")

        decision = AVADecision(
            brick_id=self.brick_id,
            state=state,
            can_draft=True,
            approval_required=approval_required,
            routed_brick=routed,
            draft_type=draft_type,
            blocked_reason=None,
            notes=notes,
            metadata={"approved_bricks": sorted(approved_bricks), "mode": "business_operator_guard"},
        )
        return asdict(decision)

    def _route(self, lower: str) -> str | None:
        for marker, brick in self.ROUTES.items():
            if marker in lower:
                return brick
        return None

    @staticmethod
    def _draft_type(lower: str) -> str:
        if any(word in lower for word in ["caption", "post", "facebook", "social"]):
            return "content_draft"
        if any(word in lower for word in ["sales", "lead", "offer", "close"]):
            return "sales_draft"
        if any(word in lower for word in ["plan", "strategy", "roadmap"]):
            return "plan_draft"
        if any(word in lower for word in ["reply", "customer", "support"]):
            return "customer_reply_draft"
        return "general_business_draft"
