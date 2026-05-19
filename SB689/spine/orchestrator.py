from __future__ import annotations

from typing import Any

from brains.deliberative.node import DeliberativeBraid
from brains.reactive.node import ReactiveBraid
from brains.reflective.node import ReflectiveBraid
from hive.memory_sync import MemoryBus
from hive.node_registry import NodeRegistry
from security.shieldbrick_001 import ShieldBrick001
from spine.truth_ledger import TruthLedger


class STITCH:
    """SB689 public-safe starter orchestrator with SHIELDBRICK-001 clipped on."""

    def __init__(self) -> None:
        self.registry = NodeRegistry()
        self.memory = MemoryBus()
        self.ledger = TruthLedger()
        self.shield = ShieldBrick001()
        self.braids = [ReactiveBraid(), DeliberativeBraid(), ReflectiveBraid()]
        for braid in self.braids:
            self.registry.register(name=braid.name, role="braid_processor", trust_score=0.95)
        self.registry.register(name="shieldbrick_001", role="security_governance_clip_brick", trust_score=0.97)

    def boot(self) -> dict[str, Any]:
        event = self.ledger.append(
            "STITCH_BOOT",
            {
                "system": "SB689 STITCH HIVE",
                "nodes": self.registry.list_nodes(),
                "shieldbrick": "SHIELDBRICK-001",
                "ledger_verified": self.ledger.verify(),
            },
        )
        return {
            "status": "SB689 STITCH HIVE ONLINE",
            "connected_nodes": self.registry.count(),
            "shieldbrick": "CLIPPED_ON",
            "ledger_event": event.event_hash,
            "nodes": self.registry.list_nodes(),
        }

    def process(self, user_input: str, context: dict[str, Any] | None = None) -> dict[str, Any]:
        context = context or {}
        shield_decision = self.shield.inspect(user_input, context)
        results = [braid.process(user_input, context) for braid in self.braids]
        braid_risk_count = sum(len(result.risks) for result in results)
        shield_risk_count = len(shield_decision["blocks"])
        total_risk_count = braid_risk_count + shield_risk_count
        avg_confidence = sum(result.confidence for result in results) / len(results)
        accepted = total_risk_count == 0 and shield_decision["allowed"]
        consensus = {
            "accepted": accepted,
            "risk_count": total_risk_count,
            "avg_confidence": round(avg_confidence, 3),
            "shield_state": shield_decision["state"],
            "human_approval_required": shield_decision["human_approval_required"],
            "final_note": self._final_note(accepted, shield_decision),
        }
        memory_entry = self.memory.write(
            "stitch_consensus",
            {
                "input": user_input,
                "shield_decision": shield_decision,
                "consensus": consensus,
                "braids": [result.__dict__ for result in results],
            },
        )
        ledger_event = self.ledger.append(
            "STITCH_PROCESS_SHIELDED",
            {
                "input_preview": user_input[:180],
                "shield_state": shield_decision["state"],
                "shield_blocks": shield_decision["blocks"],
                "consensus": consensus,
                "memory_created_at": memory_entry.created_at,
            },
        )
        return {
            "system": "SB689 STITCH HIVE",
            "input": user_input,
            "shieldbrick_001": shield_decision,
            "braid_results": [result.__dict__ for result in results],
            "consensus": consensus,
            "ledger_hash": ledger_event.event_hash,
            "ledger_verified": self.ledger.verify(),
        }

    @staticmethod
    def _final_note(accepted: bool, shield_decision: dict[str, Any]) -> str:
        if shield_decision["state"] == "RED":
            return "Blocked by SHIELDBRICK-001 until authorized human/legal/security review clears it."
        if shield_decision["state"] == "YELLOW":
            return "Sensitive action: proceed only with human approval and VERA-style boundary check."
        if accepted:
            return "Proceed with bounded response and ledger record."
        return "Proceed only after VERA-style boundary check."
