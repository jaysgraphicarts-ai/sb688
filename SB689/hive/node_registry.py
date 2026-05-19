from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime, timezone


@dataclass
class HiveNodeInfo:
    name: str
    role: str
    trust_score: float
    status: str
    registered_at: str


class NodeRegistry:
    def __init__(self) -> None:
        self._nodes: dict[str, HiveNodeInfo] = {}

    def register(self, name: str, role: str, trust_score: float = 1.0) -> HiveNodeInfo:
        node = HiveNodeInfo(
            name=name,
            role=role,
            trust_score=max(0.0, min(1.0, trust_score)),
            status="ONLINE",
            registered_at=datetime.now(timezone.utc).isoformat(),
        )
        self._nodes[name] = node
        return node

    def list_nodes(self) -> list[dict[str, object]]:
        return [asdict(node) for node in self._nodes.values()]

    def count(self) -> int:
        return len(self._nodes)
