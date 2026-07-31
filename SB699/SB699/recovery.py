"""Verification-first backup, patrol, and setback recovery for SB-699.

This module protects byte payloads. It does not claim to repair arbitrary running
applications: callers must stop or quiesce a workload before applying recovery.
"""

from __future__ import annotations

import hashlib
import json
import os
import secrets
import shutil
import tempfile
import threading
import time
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Dict, Iterable, Optional


class RecoveryError(RuntimeError):
    """Raised when verification prevents an unsafe state transition."""


def _sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _canonical(value: object) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":")).encode("utf-8")


@dataclass(frozen=True)
class Snapshot:
    snapshot_id: str
    created_at: int
    payload_hash: str
    payload_size: int
    reason: str
    previous_manifest_hash: str
    manifest_hash: str


@dataclass
class NodeState:
    node_id: str
    role: str
    health: str = "unknown"
    last_patrol: Optional[int] = None
    last_hash: str = ""


class BraidRecoveryEngine:
    """Three-strand verified snapshots with a protected Phoenix reserve."""

    ROLES = ("LIVE", "MIRROR", "WITNESS")

    def __init__(self, root: Path | str) -> None:
        self.root = Path(root).resolve()
        self.snapshots = self.root / "snapshots"
        self.phoenix = self.root / "phoenix_reserve"
        self.audit_path = self.root / "audit.jsonl"
        self.nodes: Dict[str, NodeState] = {
            role.lower(): NodeState(role.lower(), role) for role in self.ROLES
        }
        self._lock = threading.RLock()
        for directory in (self.root, self.snapshots, self.phoenix):
            directory.mkdir(parents=True, exist_ok=True)

    def _atomic_write(self, target: Path, data: bytes) -> None:
        target.parent.mkdir(parents=True, exist_ok=True)
        fd, temporary = tempfile.mkstemp(prefix=".sb699-", dir=target.parent)
        try:
            with os.fdopen(fd, "wb") as stream:
                stream.write(data)
                stream.flush()
                os.fsync(stream.fileno())
            os.replace(temporary, target)
        finally:
            if os.path.exists(temporary):
                os.unlink(temporary)

    def _audit(self, event: str, detail: dict) -> None:
        previous = "GENESIS"
        if self.audit_path.exists():
            lines = self.audit_path.read_text(encoding="utf-8").splitlines()
            if lines:
                previous = json.loads(lines[-1])["hash"]
        body = {"time": int(time.time()), "event": event, "detail": detail, "previous": previous}
        body["hash"] = _sha256(_canonical(body))
        with self.audit_path.open("a", encoding="utf-8", newline="\n") as stream:
            stream.write(json.dumps(body, sort_keys=True) + "\n")
            stream.flush()
            os.fsync(stream.fileno())

    def _latest_manifest_hash(self) -> str:
        manifests = sorted(self.snapshots.glob("*/manifest.json"))
        if not manifests:
            return "GENESIS"
        return json.loads(manifests[-1].read_text(encoding="utf-8"))["manifest_hash"]

    def checkpoint_before_reset(self, payload: bytes, reason: str = "pre-reset") -> Snapshot:
        """Create and verify all braid strands before reset authorization."""
        if not payload:
            raise RecoveryError("empty payload cannot become a trusted checkpoint")
        with self._lock:
            snapshot_id = f"{int(time.time())}-{secrets.token_hex(6)}"
            target = self.snapshots / snapshot_id
            target.mkdir()
            payload_hash = _sha256(payload)
            for role in self.ROLES:
                self._atomic_write(target / f"{role.lower()}.bin", payload)
            previous = self._latest_manifest_hash()
            body = {
                "snapshot_id": snapshot_id,
                "created_at": int(time.time()),
                "payload_hash": payload_hash,
                "payload_size": len(payload),
                "reason": reason[:160],
                "previous_manifest_hash": previous,
            }
            body["manifest_hash"] = _sha256(_canonical(body))
            self._atomic_write(target / "manifest.json", _canonical(body))
            if not self.verify_snapshot(snapshot_id):
                shutil.rmtree(target)
                raise RecoveryError("braid verification failed; reset refused")
            # Phoenix reserve is independent from the working snapshot directory.
            reserve = self.phoenix / snapshot_id
            shutil.copytree(target, reserve)
            if not self._verify_at(reserve):
                shutil.rmtree(reserve)
                raise RecoveryError("Phoenix reserve verification failed; reset refused")
            self._audit("checkpoint_verified", {"snapshot_id": snapshot_id, "hash": payload_hash})
            return Snapshot(**body)

    def _verify_at(self, directory: Path) -> bool:
        try:
            manifest = json.loads((directory / "manifest.json").read_text(encoding="utf-8"))
            claimed = manifest.pop("manifest_hash")
            if claimed != _sha256(_canonical(manifest)):
                return False
            hashes = [_sha256((directory / f"{r.lower()}.bin").read_bytes()) for r in self.ROLES]
            return len(set(hashes)) == 1 and hashes[0] == manifest["payload_hash"]
        except (OSError, KeyError, ValueError, json.JSONDecodeError):
            return False

    def verify_snapshot(self, snapshot_id: str) -> bool:
        if not snapshot_id or Path(snapshot_id).name != snapshot_id:
            return False
        return self._verify_at(self.snapshots / snapshot_id)

    def authorize_reset(self, snapshot_id: str) -> dict:
        """Return reset authorization only when working and reserve copies agree."""
        with self._lock:
            working = self.snapshots / snapshot_id
            reserve = self.phoenix / snapshot_id
            passed = self._verify_at(working) and self._verify_at(reserve)
            if not passed:
                self._audit("reset_refused", {"snapshot_id": snapshot_id})
                raise RecoveryError("reset refused: checkpoint or Phoenix reserve is unverified")
            token = secrets.token_urlsafe(24)
            self._audit("reset_authorized", {"snapshot_id": snapshot_id, "token_hash": _sha256(token.encode())})
            return {"authorized": True, "snapshot_id": snapshot_id, "one_time_token": token}

    def phoenix_setback(self, snapshot_id: str) -> bytes:
        """Read a verified recovery payload; caller controls the application restore."""
        with self._lock:
            reserve = self.phoenix / snapshot_id
            if not self._verify_at(reserve):
                raise RecoveryError("Phoenix setback refused: reserve is unverified")
            payload = (reserve / "live.bin").read_bytes()
            self._audit("phoenix_setback_read", {"snapshot_id": snapshot_id, "hash": _sha256(payload)})
            return payload

    def patrol(self, payloads: Dict[str, bytes]) -> dict:
        """Patrol registered nodes and isolate disagreement; no majority guessing."""
        now = int(time.time())
        hashes = {node: _sha256(data) for node, data in payloads.items() if node in self.nodes}
        consensus = len(hashes) == len(self.nodes) and len(set(hashes.values())) == 1
        for node_id, node in self.nodes.items():
            node.last_patrol = now
            node.last_hash = hashes.get(node_id, "")
            node.health = "healthy" if consensus else ("quarantined" if node_id in hashes else "offline")
        report = {"passed": consensus, "nodes": [asdict(node) for node in self.nodes.values()]}
        self._audit("node_patrol", {"passed": consensus, "hashes": hashes})
        return report

    def atmosphere(self, *, memory_percent: float, disk_percent: float, heartbeat_age_s: float) -> dict:
        """Evaluate the runtime envelope around the braid using explicit thresholds."""
        checks = {
            "memory": "critical" if memory_percent >= 90 else "warning" if memory_percent >= 70 else "healthy",
            "disk": "critical" if disk_percent >= 95 else "warning" if disk_percent >= 80 else "healthy",
            "heartbeat": "critical" if heartbeat_age_s > 30 else "warning" if heartbeat_age_s > 10 else "healthy",
        }
        state = "critical" if "critical" in checks.values() else "warning" if "warning" in checks.values() else "healthy"
        report = {"state": state, "checks": checks, "observed_at": int(time.time())}
        self._audit("atmosphere_observed", report)
        return report
