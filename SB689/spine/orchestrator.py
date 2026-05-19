from __future__ import annotations

from typing import Any

from ava.avabrick_001 import AVABrick001
from brains.deliberative.node import DeliberativeBraid
from brains.reactive.node import ReactiveBraid
from brains.reflective.node import ReflectiveBraid
from business.clipperx_001 import ClipperX001
from chip.chipforge_001 import ChipForge001
from hive.memory_sync import MemoryBus
from hive.node_registry import NodeRegistry
from security.shieldbrick_001 import ShieldBrick001
from spine.truth_ledger import TruthLedger


class STITCH:
    """SB689 public-safe starter orchestrator with SHIELD, CLIPPERX, CHIPFORGE, and AVA clipped on."""

    def __init__(self) -> None:
        self.registry = NodeRegistry()
        self.memory = MemoryBus()
        self.ledger = TruthLedger()
        self.shield = ShieldBrick001()
        self.clipperx = ClipperX001()
        self.chipforge = ChipForge001()
        self.ava = AVABrick001()
        self.braids = [ReactiveBraid(), DeliberativeBraid(), ReflectiveBraid()]
        for braid in self.braids:
            self.registry.register(name=braid.name, role="braid_processor", trust_score=0.95)
        self.registry.register(name="shieldbrick_001", role="security_governance_clip_brick", trust_score=0.97)
        self.registry.register(name="clipperx_001", role="business_connector_clip_brick", trust_score=0.96)
        self.registry.register(name="chipforge_001", role="microchip_rewrite_programming_clip_brick", trust_score=0.96)
        self.registry.register(name="avabrick_001", role="business_operator_clip_brick", trust_score=0.95)

    def boot(self) -> dict[str, Any]:
        event = self.ledger.append(
            "STITCH_BOOT",
            {
                "system": "SB689 STITCH HIVE",
                "nodes": self.registry.list_nodes(),
                "shieldbrick": "SHIELDBRICK-001",
                "clipperx": "CLIPPERX-001",
                "chipforge": "CHIPFORGE-001",
                "avabrick": "AVABRICK-001",
                "ledger_verified": self.ledger.verify(),
            },
        )
        return {
            "status": "SB689 STITCH HIVE ONLINE",
            "connected_nodes": self.registry.count(),
            "shieldbrick": "CLIPPED_ON",
            "clipperx": "CLIPPED_ON",
            "chipforge": "CLIPPED_ON",
            "avabrick": "CLIPPED_ON",
            "ledger_event": event.event_hash,
            "nodes": self.registry.list_nodes(),
        }

    def process(self, user_input: str, context: dict[str, Any] | None = None) -> dict[str, Any]:
        context = context or {}
        shield_decision = self.shield.inspect(user_input, context)
        clipperx_decision = self.clipperx.inspect(context)
        chipforge_decision = self.chipforge.inspect(context)
        ava_decision = self.ava.inspect(user_input, clipperx_decision, shield_decision, context)
        results = [braid.process(user_input, context) for braid in self.braids]
        braid_risk_count = sum(len(result.risks) for result in results)
        shield_risk_count = len(shield_decision["blocks"])
        clipperx_missing_count = len(clipperx_decision["missing_requirements"])
        chipforge_missing_count = len(chipforge_decision["missing_requirements"])
        total_risk_count = braid_risk_count + shield_risk_count
        avg_confidence = sum(result.confidence for result in results) / len(results)
        accepted = total_risk_count == 0 and shield_decision["allowed"]
        consensus = {
            "accepted": accepted,
            "risk_count": total_risk_count,
            "avg_confidence": round(avg_confidence, 3),
            "shield_state": shield_decision["state"],
            "clipperx_state": clipperx_decision["state"],
            "chipforge_state": chipforge_decision["state"],
            "ava_state": ava_decision["state"],
            "can_launch_ava": clipperx_decision["can_launch_ava"],
            "card_ready": chipforge_decision["card_ready"],
            "rewrite_allowed": chipforge_decision["rewrite_allowed"],
            "ava_can_draft": ava_decision["can_draft"],
            "ava_approval_required": ava_decision["approval_required"],
            "clipperx_missing_count": clipperx_missing_count,
            "chipforge_missing_count": chipforge_missing_count,
            "human_approval_required": shield_decision["human_approval_required"] or ava_decision["approval_required"],
            "final_note": self._final_note(accepted, shield_decision, clipperx_decision, chipforge_decision, ava_decision),
        }
        memory_entry = self.memory.write(
            "stitch_consensus",
            {
                "input": user_input,
                "shield_decision": shield_decision,
                "clipperx_decision": clipperx_decision,
                "chipforge_decision": chipforge_decision,
                "ava_decision": ava_decision,
                "consensus": consensus,
                "braids": [result.__dict__ for result in results],
            },
        )
        ledger_event = self.ledger.append(
            "STITCH_PROCESS_SHIELDED_CLIPPERX_CHIPFORGE_AVA",
            {
                "input_preview": user_input[:180],
                "shield_state": shield_decision["state"],
                "shield_blocks": shield_decision["blocks"],
                "clipperx_state": clipperx_decision["state"],
                "clipperx_missing": clipperx_decision["missing_requirements"],
                "chipforge_state": chipforge_decision["state"],
                "chipforge_missing": chipforge_decision["missing_requirements"],
                "card_manifest_hash": chipforge_decision["card_manifest_hash"],
                "ava_state": ava_decision["state"],
                "ava_route": ava_decision["routed_brick"],
                "consensus": consensus,
                "memory_created_at": memory_entry.created_at,
            },
        )
        return {
            "system": "SB689 STITCH HIVE",
            "input": user_input,
            "shieldbrick_001": shield_decision,
            "clipperx_001": clipperx_decision,
            "chipforge_001": chipforge_decision,
            "avabrick_001": ava_decision,
            "braid_results": [result.__dict__ for result in results],
            "consensus": consensus,
            "ledger_hash": ledger_event.event_hash,
            "ledger_verified": self.ledger.verify(),
        }

    @staticmethod
    def _final_note(
        accepted: bool,
        shield_decision: dict[str, Any],
        clipperx_decision: dict[str, Any],
        chipforge_decision: dict[str, Any],
        ava_decision: dict[str, Any],
    ) -> str:
        if shield_decision["state"] == "RED":
            return "Blocked by SHIELDBRICK-001 until authorized human/legal/security review clears it."
        if chipforge_decision["state"] == "REVOKED":
            return "Card is revoked by CHIPFORGE-001 and must not open the business room."
        if clipperx_decision["state"] != "LIVE_ROOM":
            return "Business room not live yet: CLIPPERX requires room, owner, access key, Memory Chip, approved bricks, and STITCH handshake."
        if not chipforge_decision["card_ready"]:
            return "Business room may exist, but CHIPFORGE card packet is not READY; finish programming, hash seal, bind, and ledger it."
        if ava_decision["approval_required"]:
            return "AVA can draft only as approval-prep; human approval required before external commit."
        if shield_decision["state"] == "YELLOW":
            return "Sensitive action: proceed only with human approval and VERA-style boundary check."
        if accepted and ava_decision["can_draft"]:
            return "Proceed with bounded AVA draft, live room, programmed card, and ledger record."
        if accepted:
            return "Proceed with bounded response, live room, programmed card, and ledger record."
        return "Proceed only after VERA-style boundary check."
