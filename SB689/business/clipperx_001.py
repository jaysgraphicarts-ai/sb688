from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any


@dataclass
class ClipperXDecision:
    brick_id: str
    state: str
    can_launch_ava: bool
    handshake_required: bool
    missing_requirements: list[str]
    loaded_bricks: list[str]
    notes: list[str]
    metadata: dict[str, Any]


class ClipperX001:
    """Business connector brick for demo -> room -> key -> Memory Chip -> bricks -> AVA.

    This runtime module models the connection logic locally. Live operation still requires
    Supabase Auth, RLS, access pass records, Memory Chip records, and the deployed STITCH handshake.
    """

    brick_id = "CLIPPERX-001"

    VALID_ACCESS_STATES = {"LEASED_MONTHLY", "PAID_OUT"}

    def inspect(self, context: dict[str, Any] | None = None) -> dict[str, Any]:
        context = context or {}
        industry = context.get("industry")
        business_room_id = context.get("business_room_id")
        owner_verified = bool(context.get("owner_verified"))
        access_state = context.get("access_state", "DEMO")
        access_key_bound = bool(context.get("access_key_bound"))
        memory_chip_id = context.get("memory_chip_id")
        approved_bricks = list(context.get("approved_bricks", []))
        stitch_handshake_passed = bool(context.get("stitch_handshake_passed"))

        missing: list[str] = []
        notes: list[str] = []

        if not industry:
            missing.append("industry")
        if not business_room_id:
            missing.append("business_room_id")
        if not owner_verified:
            missing.append("owner_verified")
        if access_state not in self.VALID_ACCESS_STATES:
            missing.append("valid_access_state")
        if not access_key_bound:
            missing.append("access_key_bound")
        if not memory_chip_id:
            missing.append("memory_chip_id")
        if not approved_bricks:
            missing.append("approved_bricks")
        if not stitch_handshake_passed:
            missing.append("stitch_handshake_passed")

        state = "DEMO"
        if business_room_id and not owner_verified:
            state = "INTAKE_PENDING"
        if business_room_id and owner_verified:
            state = "ROOM_READY"
        if access_key_bound:
            state = "KEY_BOUND"
        if memory_chip_id:
            state = "CHIP_LINKED"
        if approved_bricks:
            state = "BRICKS_ATTACHED"
        if approved_bricks and not stitch_handshake_passed:
            state = "HANDSHAKE_REQUIRED"
        if not missing:
            state = "LIVE_ROOM"

        can_launch_ava = state == "LIVE_ROOM"
        handshake_required = state in {"HANDSHAKE_REQUIRED", "BRICKS_ATTACHED", "CHIP_LINKED", "KEY_BOUND"}

        if can_launch_ava:
            notes.append("AVA room may launch inside verified business room.")
        else:
            notes.append("AVA launch blocked until all CLIPPERX requirements are satisfied.")

        decision = ClipperXDecision(
            brick_id=self.brick_id,
            state=state,
            can_launch_ava=can_launch_ava,
            handshake_required=handshake_required,
            missing_requirements=missing,
            loaded_bricks=approved_bricks,
            notes=notes,
            metadata={
                "industry": industry,
                "access_state": access_state,
                "valid_access_states": sorted(self.VALID_ACCESS_STATES),
                "mode": "business_connector_guard",
            },
        )
        return asdict(decision)
