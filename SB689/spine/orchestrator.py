from __future__ import annotations

from typing import Any

from brains.deliberative.node import DeliberativeBraid
from brains.reactive.node import ReactiveBraid
from brains.reflective.node import ReflectiveBraid
from hive.memory_sync import MemoryBus
from hive.node_registry import NodeRegistry
from spine.truth_ledger import TruthLedger


class STITCH:
    """SB689 public-safe starter orchestrator."""

    def __init__(self) -> None:
        self.registry = NodeRegistry()
        self.memory = MemoryBus()
        self.ledger = TruthLedger()
        self.braids = [ReactiveBraid(), DeliberativeBraid(), ReflectiveBraid()]
        for braid in self.braids:
            self.registry.register(name=braid.name, role="braid_processor", trust_score=0.95)

    def boot(self) -> dict[str, Any]:
        event = self.ledger.append(
            "STITCH_BOOT",
            {
                "system": "SB689 STITCH HIVE",
                "nodes": self.registry.list_nodes(),
                "ledger_verified": self.ledger.verify(),
            },
        )
        return {
            "status": "SB689 STITCH HIVE ONLINE",
            "connected_nodes": self.registry.count(),
            "ledger_event": event.event_hash,
            "nodes": self.registry.list_nodes(),
        }

    def process(self, user_input: str, context: dict[str, Any] | None = None) -> dict[str, Any]:
        context = context or {}
        results = [braid.process(user_input, context) for braid in self.braids]
        risk_count = sum(len(result.risks) for result in results)
        avg_confidence = sum(result.confidence for result in results) / len(results)
        consensus = {
            "accepted": risk_count == 0,
            "risk_count": risk_count,
            "avg_confidence": round(avg_confidence, 3),
            "final_note": "Proceed with bounded response." if risk_count == 0 else "Proceed only after VERA-style boundary check.",
        }
        memory_entry = self.memory.write(
            "stitch_consensus",
            {
                "input": user_input,
                "consensus": consensus,
                "braids": [result.__dict__ for result in results],
            },
        )
        ledger_event = self.ledger.append(
            "STITCH_PROCESS",
            {
                "input_preview": user_input[:180],
                "consensus": consensus,
                "memory_created_at": memory_entry.created_at,
            },
        )
        return {
            "system": "SB689 STITCH HIVE",
            "input": user_input,
            "braid_results": [result.__dict__ for result in results],
            "consensus": consensus,
            "ledger_hash": ledger_event.event_hash,
            "ledger_verified": self.ledger.verify(),
        }
