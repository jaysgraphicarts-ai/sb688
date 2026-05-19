from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from typing import Any


@dataclass
class MemoryEntry:
    source: str
    content: dict[str, Any]
    created_at: str


class MemoryBus:
    """In-memory bus for local starter runs. Replace with Redis/Postgres for production."""

    def __init__(self) -> None:
        self._entries: list[MemoryEntry] = []

    def write(self, source: str, content: dict[str, Any]) -> MemoryEntry:
        entry = MemoryEntry(source=source, content=content, created_at=datetime.now(timezone.utc).isoformat())
        self._entries.append(entry)
        return entry

    def read_all(self) -> list[dict[str, Any]]:
        return [asdict(entry) for entry in self._entries]

    def clear(self) -> None:
        self._entries.clear()
