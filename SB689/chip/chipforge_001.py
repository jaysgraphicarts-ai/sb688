from __future__ import annotations

import hashlib
import json
from dataclasses import asdict, dataclass
from typing import Any


@dataclass
class ChipForgeDecision:
    brick_id: str
    state: str
    card_ready: bool
    rewrite_allowed: bool
    bind_allowed: bool
    missing_requirements: list[str]
    card_manifest_hash: str | None
    notes: list[str]
    metadata: dict[str, Any]


class ChipForge001:
    """Microchip rewrite + programming brick for SB688 32GB braided card packets.

    The card is treated as a physical access packet and portable kit, not as the secure truth source.
    Live secrets stay backend-side.
    """

    brick_id = "CHIPFORGE-001"

    SAFE_PACKET_TYPES = {"public_demo", "industry_packet", "brand_kit", "encrypted_export", "onboarding_docs"}

    def inspect(self, context: dict[str, Any] | None = None) -> dict[str, Any]:
        context = context or {}
        card_id = context.get("card_id")
        business_room_id = context.get("business_room_id")
        memory_chip_id = context.get("memory_chip_id")
        owner_approved = bool(context.get("owner_approved_card_programming"))
        card_packet_types = set(context.get("card_packet_types", []))
        qr_route = context.get("qr_route")
        existing_card_hash = context.get("existing_card_hash")
        rewrite_requested = bool(context.get("rewrite_requested"))
        revoke_requested = bool(context.get("revoke_requested"))
        restore_requested = bool(context.get("restore_requested"))

        missing: list[str] = []
        notes: list[str] = []

        if not card_id:
            missing.append("card_id")
        if not business_room_id:
            missing.append("business_room_id")
        if not memory_chip_id:
            missing.append("memory_chip_id")
        if not owner_approved:
            missing.append("owner_approved_card_programming")
        if not qr_route:
            missing.append("qr_route")
        if not card_packet_types:
            missing.append("card_packet_types")

        unsafe_packet_types = sorted(card_packet_types - self.SAFE_PACKET_TYPES)
        if unsafe_packet_types:
            missing.append("safe_card_packet_types_only")
            notes.append(f"Unsafe packet type request blocked: {', '.join(unsafe_packet_types)}")

        manifest_hash = None
        if card_id and business_room_id and memory_chip_id and qr_route:
            manifest_hash = self._hash_manifest(
                {
                    "card_id": card_id,
                    "business_room_id": business_room_id,
                    "memory_chip_id": memory_chip_id,
                    "qr_route": qr_route,
                    "card_packet_types": sorted(card_packet_types),
                }
            )

        if revoke_requested:
            state = "REVOKED"
            notes.append("Card marked revoked; it must not open the business room.")
        elif restore_requested:
            state = "RESTORE_READY" if business_room_id and memory_chip_id else "UNPROGRAMMED"
            notes.append("Restore requested; replacement card must receive a new binding and ledger event.")
        elif rewrite_requested:
            if not existing_card_hash:
                missing.append("existing_card_hash")
                state = "REWRITE_REQUIRED"
                notes.append("Rewrite requested but existing card hash is missing.")
            elif missing:
                state = "REWRITE_REQUIRED"
            else:
                state = "HASH_SEALED"
                notes.append("Rewrite can proceed after ledgering old hash and new hash.")
        elif missing:
            state = "UNPROGRAMMED"
        else:
            state = "READY"
            notes.append("Card packet can be issued after STITCH handshake test and ledger record.")

        card_ready = state == "READY"
        rewrite_allowed = rewrite_requested and state == "HASH_SEALED" and not missing
        bind_allowed = bool(card_id and business_room_id and memory_chip_id and owner_approved)

        decision = ChipForgeDecision(
            brick_id=self.brick_id,
            state=state,
            card_ready=card_ready,
            rewrite_allowed=rewrite_allowed,
            bind_allowed=bind_allowed,
            missing_requirements=missing,
            card_manifest_hash=manifest_hash,
            notes=notes,
            metadata={
                "safe_packet_types": sorted(self.SAFE_PACKET_TYPES),
                "mode": "microchip_rewrite_programming_guard",
                "secrets_policy": "no raw secrets on card",
            },
        )
        return asdict(decision)

    @staticmethod
    def _hash_manifest(manifest: dict[str, Any]) -> str:
        body = json.dumps(manifest, sort_keys=True, separators=(",", ":"))
        return hashlib.sha256(body.encode("utf-8")).hexdigest()
