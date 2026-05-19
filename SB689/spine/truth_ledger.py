from __future__ import annotations

import hashlib
import json
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional


@dataclass
class LedgerEvent:
    index: int
    event_type: str
    payload: dict[str, Any]
    previous_hash: str
    event_hash: str
    created_at: str


class TruthLedger:
    """Append-only SHA256 event ledger for public-safe SB689 local runs."""

    def __init__(self, path: str = "runtime/truth_ledger.jsonl") -> None:
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def _last_event(self) -> Optional[LedgerEvent]:
        if not self.path.exists():
            return None
        lines = [line for line in self.path.read_text(encoding="utf-8").splitlines() if line.strip()]
        if not lines:
            return None
        raw = json.loads(lines[-1])
        return LedgerEvent(**raw)

    def append(self, event_type: str, payload: dict[str, Any]) -> LedgerEvent:
        last = self._last_event()
        index = 0 if last is None else last.index + 1
        previous_hash = "GENESIS" if last is None else last.event_hash
        created_at = datetime.now(timezone.utc).isoformat()
        event_hash = self._hash_event(index, event_type, payload, previous_hash, created_at)
        event = LedgerEvent(index, event_type, payload, previous_hash, event_hash, created_at)
        with self.path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(asdict(event), sort_keys=True) + "\n")
        return event

    @staticmethod
    def _hash_event(index: int, event_type: str, payload: dict[str, Any], previous_hash: str, created_at: str) -> str:
        body = json.dumps(
            {
                "index": index,
                "event_type": event_type,
                "payload": payload,
                "previous_hash": previous_hash,
                "created_at": created_at,
            },
            sort_keys=True,
            separators=(",", ":"),
        )
        return hashlib.sha256(body.encode("utf-8")).hexdigest()

    def verify(self) -> bool:
        if not self.path.exists():
            return True
        previous = "GENESIS"
        for i, line in enumerate(self.path.read_text(encoding="utf-8").splitlines()):
            if not line.strip():
                continue
            raw = json.loads(line)
            expected = self._hash_event(raw["index"], raw["event_type"], raw["payload"], raw["previous_hash"], raw["created_at"])
            if raw["index"] != i or raw["previous_hash"] != previous or raw["event_hash"] != expected:
                return False
            previous = raw["event_hash"]
        return True
