"""Fail-closed IronLink3 control plane for the Stitch Brick technology family."""

from __future__ import annotations

import hashlib
import hmac
import json
import os
import secrets
import ssl
import threading
import time
import urllib.parse
import urllib.request
from dataclasses import asdict, dataclass
from typing import Dict, Iterable, Optional


def canonical(value: object) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"))


def digest(value: object) -> str:
    return hashlib.sha256(canonical(value).encode("utf-8")).hexdigest()


@dataclass
class Module:
    module_id: str
    name: str
    plane: str
    authority: str
    integration: str
    health: str = "declared"
    last_verified: Optional[int] = None


DEFAULT_MODULES = (
    Module("sb688", "SB-688 Truth Gate", "verification", "VERA", "external"),
    Module("sb689", "SB-689 Recovery Ledger", "recovery", "VERA", "external"),
    Module("sb701", "SB-701 Heartbeat", "coordination", "AVA", "external"),
    Module("sb712", "SB-712 Kernel", "kernel", "AVA", "external"),
    Module("oasis", "OASIS Platform", "operations", "AVA", "external"),
    Module("ava", "AVA Governance", "governance", "OWNER", "declared"),
    Module("vera", "VERA Verification", "verification", "AVA", "declared"),
    Module("orion", "ORION Strategy", "strategy", "AVA", "declared"),
    Module("brick1", "Brick 1 Graphic Arts", "business", "AVA", "external"),
    Module("brick2", "Brick 2 Music & Social", "business", "AVA", "external"),
    Module("brick3", "Brick 3 Data Integrity", "business", "AVA", "external"),
    Module("control", "Unified Control Room", "control", "OWNER", "local", "healthy"),
)


class AuditLedger:
    def __init__(self) -> None:
        self._entries = []
        self._lock = threading.RLock()

    def append(self, event: str, actor: str, detail: Dict) -> Dict:
        with self._lock:
            previous = self._entries[-1]["hash"] if self._entries else "GENESIS"
            body = {
                "sequence": len(self._entries) + 1,
                "timestamp": int(time.time()),
                "event": event,
                "actor": actor,
                "detail": detail,
                "previous_hash": previous,
            }
            body["hash"] = digest(body)
            self._entries.append(body)
            return dict(body)

    def verify(self) -> bool:
        previous = "GENESIS"
        with self._lock:
            for position, entry in enumerate(self._entries, 1):
                body = {k: v for k, v in entry.items() if k != "hash"}
                if entry["sequence"] != position or entry["previous_hash"] != previous:
                    return False
                if not hmac.compare_digest(entry["hash"], digest(body)):
                    return False
                previous = entry["hash"]
        return True

    def entries(self) -> list:
        with self._lock:
            return [dict(item) for item in self._entries]


class NonceGuard:
    def __init__(self, ttl: int = 300) -> None:
        self.ttl = ttl
        self._seen: Dict[str, float] = {}
        self._lock = threading.Lock()

    def accept(self, nonce: str) -> bool:
        if len(nonce) < 16 or len(nonce) > 256:
            return False
        now = time.time()
        with self._lock:
            self._seen = {key: expiry for key, expiry in self._seen.items() if expiry > now}
            if nonce in self._seen:
                return False
            self._seen[nonce] = now + self.ttl
            return True


class IronLink3Adapter:
    PROTOCOL = "sb-stitch/1"

    def __init__(self, endpoint: str = "", shared_secret: str = "") -> None:
        self.endpoint = endpoint.rstrip("/")
        self.shared_secret = shared_secret
        self.connected = False
        self.last_error = "not configured"
        self.last_verified: Optional[int] = None

    def _validate_configuration(self) -> None:
        parsed = urllib.parse.urlparse(self.endpoint)
        if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password:
            raise ValueError("IronLink3 endpoint must be a credential-free HTTPS URL")
        if len(self.shared_secret) < 32:
            raise ValueError("IronLink3 shared secret must be at least 32 characters")

    def connect(self) -> bool:
        try:
            self._validate_configuration()
            timestamp = str(int(time.time()))
            path = "/v1/handshake"
            signature = hmac.new(
                self.shared_secret.encode("utf-8"),
                f"GET\n{path}\n{timestamp}".encode("utf-8"),
                hashlib.sha256,
            ).hexdigest()
            request = urllib.request.Request(
                self.endpoint + path,
                headers={
                    "Accept": "application/json",
                    "User-Agent": "JGA-IronLink3-Control/1.0",
                    "X-Stitch-Timestamp": timestamp,
                    "X-Stitch-Signature": signature,
                },
                method="GET",
            )
            context = ssl.create_default_context()
            with urllib.request.urlopen(request, timeout=5, context=context) as response:
                if response.status != 200:
                    raise ConnectionError(f"handshake returned HTTP {response.status}")
                payload = json.loads(response.read(65537).decode("utf-8"))
            if payload.get("name") != "ironlink3" or payload.get("protocol") != self.PROTOCOL:
                raise ConnectionError("handshake identity or protocol mismatch")
            self.connected = True
            self.last_error = ""
            self.last_verified = int(time.time())
            return True
        except Exception as exc:
            self.connected = False
            self.last_error = str(exc)[:240]
            return False

    def status(self) -> Dict:
        return {
            "configured": bool(self.endpoint and self.shared_secret),
            "connected": self.connected,
            "endpoint_host": urllib.parse.urlparse(self.endpoint).hostname or "",
            "protocol": self.PROTOCOL,
            "last_verified": self.last_verified,
            "last_error": self.last_error,
        }


class ControlPlane:
    def __init__(self, modules: Iterable[Module] = DEFAULT_MODULES) -> None:
        self.modules = {item.module_id: Module(**asdict(item)) for item in modules}
        self.ledger = AuditLedger()
        self.nonces = NonceGuard()
        self.link = IronLink3Adapter(
            os.getenv("IRONLINK3_ENDPOINT", ""), os.getenv("IRONLINK3_SHARED_SECRET", "")
        )
        self.checkpoint = 0
        self._lock = threading.RLock()
        self.ledger.append("control_plane_started", "SYSTEM", {"module_count": len(self.modules)})

    def status(self) -> Dict:
        with self._lock:
            return {
                "system": "IronLink3 Unified Stitch Brick Control Room",
                "trust": "verified" if self.verify()["passed"] else "unverified",
                "checkpoint": self.checkpoint,
                "ledger_head": len(self.ledger.entries()),
                "ironlink3": self.link.status(),
                "modules": [asdict(item) for item in self.modules.values()],
            }

    def verify(self) -> Dict:
        ids_unique = len(self.modules) == len(set(self.modules))
        authorities_valid = all(m.authority in {"OWNER", "AVA", "VERA"} for m in self.modules.values())
        integrations_valid = all(m.integration in {"local", "external", "declared"} for m in self.modules.values())
        checks = {
            "ledger_chain": self.ledger.verify(),
            "module_ids_unique": ids_unique,
            "authority_boundaries": authorities_valid,
            "integration_states": integrations_valid,
            "control_room_healthy": self.modules["control"].health == "healthy",
        }
        return {"passed": all(checks.values()), "checks": checks}

    def create_checkpoint(self) -> Dict:
        report = self.verify()
        if not report["passed"]:
            raise RuntimeError("checkpoint refused: verification failed")
        with self._lock:
            self.checkpoint += 1
            entry = self.ledger.append("checkpoint_committed", "OWNER", {"checkpoint": self.checkpoint})
            return {"checkpoint": self.checkpoint, "proof": entry["hash"]}

    def heal(self, module_id: str) -> Dict:
        module = self.modules.get(module_id)
        if module is None:
            raise KeyError("unknown module")
        if module.integration == "external":
            raise RuntimeError("external module requires a verified adapter; blind healing refused")
        module.health = "healthy"
        module.last_verified = int(time.time())
        self.ledger.append("module_healed", "VERA", {"module_id": module_id})
        return asdict(module)

    def connect_ironlink3(self) -> Dict:
        connected = self.link.connect()
        self.ledger.append(
            "ironlink3_handshake", "OWNER", {"connected": connected, "host": self.link.status()["endpoint_host"]}
        )
        return self.link.status()


def secure_token_configured(token: str) -> bool:
    return len(token) >= 24 and token not in {"replace-me", "owner", "sb688", "1234"}


def new_nonce() -> str:
    return secrets.token_urlsafe(24)
