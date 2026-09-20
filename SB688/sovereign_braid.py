"""SB688-only bidirectional integrity braid.

Responsibilities are intentionally narrow:
verify -> detect drift -> heal -> reverify -> pass trusted state.

No filesystem, UI, network stack, analytics, policy engine, LLM, database,
or persistent audit work belongs in this hot path.

This is research/software infrastructure. It is not validated for implanted,
medical, or neural stimulation hardware and provides no hard real-time guarantee.
"""

from __future__ import annotations

import hashlib
import hmac
import threading
import time
from dataclasses import dataclass


class IntegrityError(RuntimeError):
    """Fail-closed integrity violation."""


def _sha(data: bytes | bytearray) -> bytes:
    return hashlib.sha256(data).digest()


@dataclass(frozen=True)
class BraidFrame:
    channel: str
    direction: str
    sequence: int
    payload: bytes
    payload_hash: bytes
    created_ns: int

    @classmethod
    def build(
        cls, channel: str, direction: str, sequence: int, payload: bytes
    ) -> "BraidFrame":
        if direction not in {"A_TO_B", "B_TO_A"}:
            raise IntegrityError("invalid direction")
        data = bytes(payload)
        if not channel:
            raise IntegrityError("empty channel")
        if not data:
            raise IntegrityError("empty payload")
        return cls(
            channel=channel,
            direction=direction,
            sequence=sequence,
            payload=data,
            payload_hash=_sha(data),
            created_ns=time.perf_counter_ns(),
        )


class SovereignIntegrityBraid:
    """Three working strands protected by one pre-certified reserve.

    Both directions use the exact same verification and recovery path.
    There is no trusted bypass.

    A_TO_B -> VERIFY -> HEAL(if needed) -> REVERIFY -> FRAME
    B_TO_A -> VERIFY -> HEAL(if needed) -> REVERIFY -> FRAME
    """

    __slots__ = (
        "_lock",
        "_certified",
        "_certified_hash",
        "_working",
        "_sequence",
        "recoveries",
        "last_recovery_ns",
        "last_verify_ns",
    )

    def __init__(self, certified_state: bytes) -> None:
        if not certified_state:
            raise IntegrityError("empty certified state")

        state = bytes(certified_state)
        self._lock = threading.Lock()
        self._certified = state
        self._certified_hash = _sha(state)
        self._working = [
            bytearray(state),
            bytearray(state),
            bytearray(state),
        ]
        self._sequence = {"A_TO_B": 0, "B_TO_A": 0}
        self.recoveries = 0
        self.last_recovery_ns = 0
        self.last_verify_ns = 0

    def _verify_locked(self) -> bool:
        started = time.perf_counter_ns()
        expected = self._certified_hash

        ok = (
            hmac.compare_digest(_sha(self._certified), expected)
            and all(
                hmac.compare_digest(_sha(strand), expected)
                for strand in self._working
            )
        )

        self.last_verify_ns = time.perf_counter_ns() - started
        return ok

    def verify(self) -> bool:
        with self._lock:
            return self._verify_locked()

    def _heal_locked(self) -> bool:
        expected = self._certified_hash

        if not hmac.compare_digest(_sha(self._certified), expected):
            raise IntegrityError("certified reserve corrupted")

        drift = any(
            not hmac.compare_digest(_sha(strand), expected)
            for strand in self._working
        )

        if drift:
            for strand in self._working:
                strand[:] = self._certified

            if not all(
                hmac.compare_digest(_sha(strand), expected)
                for strand in self._working
            ):
                raise IntegrityError("reverification failed")

            self.recoveries += 1

        return drift

    def heal(self) -> bool:
        started = time.perf_counter_ns()
        with self._lock:
            repaired = self._heal_locked()
        self.last_recovery_ns = time.perf_counter_ns() - started
        return repaired

    def _verify_or_heal_locked(self) -> None:
        if self._verify_locked():
            return

        self._heal_locked()

        if not self._verify_locked():
            raise IntegrityError("integrity recovery failed")

    def transit(self, channel: str, direction: str, payload: bytes) -> BraidFrame:
        """Verify the braid before creating an outbound trusted frame."""
        if direction not in self._sequence:
            raise IntegrityError("invalid direction")

        with self._lock:
            self._verify_or_heal_locked()
            self._sequence[direction] += 1
            sequence = self._sequence[direction]

        frame = BraidFrame.build(channel, direction, sequence, payload)

        if not hmac.compare_digest(frame.payload_hash, _sha(frame.payload)):
            raise IntegrityError("frame verification failed")

        return frame

    def accept(self, frame: BraidFrame) -> bytes:
        """Verify inbound frame and local braid before releasing payload."""
        if frame.direction not in self._sequence:
            raise IntegrityError("invalid direction")

        if not frame.channel:
            raise IntegrityError("empty channel")

        if frame.sequence <= 0:
            raise IntegrityError("invalid sequence")

        if not hmac.compare_digest(frame.payload_hash, _sha(frame.payload)):
            raise IntegrityError("payload corruption")

        with self._lock:
            self._verify_or_heal_locked()

        return frame.payload

    def inject_test_fault(self, strand: int = 0, offset: int = 0) -> None:
        """Deterministic test-only bit flip for fault injection."""
        self._working[strand][offset] ^= 1
