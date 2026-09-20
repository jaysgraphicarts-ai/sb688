"""Minimal in-memory SB688 recovery lane for latency-sensitive integrity checks.

This module intentionally excludes filesystem, network, JSON, UI, and synchronous
persistent audit work from the hot path. Durable recovery remains a separate layer.

This is software infrastructure only. It is not validated for medical or neural
hardware use and provides no hard real-time timing guarantee on a general-purpose OS.
"""

from __future__ import annotations

import hashlib
import threading
import time


class FastRecoveryError(RuntimeError):
    """Raised when the fast lane cannot prove a safe recovery."""


def _digest(data: bytes | bytearray) -> bytes:
    return hashlib.sha256(data).digest()


class FastBraidLane:
    """Three in-memory strands backed by one pre-certified reserve.

    Recovery sequence:
        detect -> isolate by lock -> verify reserve -> restore -> reverify -> return

    The reserve is expected to be certified by the durable SB688/SB recovery plane
    before this object is armed.
    """

    __slots__ = (
        "_lock",
        "_reserve",
        "_reserve_hash",
        "_strands",
        "last_recovery_ns",
        "recoveries",
    )

    def __init__(self, certified_payload: bytes) -> None:
        if not certified_payload:
            raise FastRecoveryError("empty certified state")
        reserve = bytes(certified_payload)
        self._lock = threading.Lock()
        self._reserve = reserve
        self._reserve_hash = _digest(reserve)
        self._strands = [bytearray(reserve), bytearray(reserve), bytearray(reserve)]
        self.last_recovery_ns = 0
        self.recoveries = 0

    def verify(self) -> bool:
        reserve_hash = self._reserve_hash
        return _digest(self._reserve) == reserve_hash and all(
            _digest(strand) == reserve_hash for strand in self._strands
        )

    def recover(self) -> bytes:
        """Return certified state after fail-closed verification and repair."""
        started = time.perf_counter_ns()
        with self._lock:
            reserve_hash = self._reserve_hash
            if _digest(self._reserve) != reserve_hash:
                raise FastRecoveryError("reserve verification failed")

            damaged = any(_digest(strand) != reserve_hash for strand in self._strands)
            if damaged:
                reserve = self._reserve
                for strand in self._strands:
                    strand[:] = reserve
                if any(_digest(strand) != reserve_hash for strand in self._strands):
                    raise FastRecoveryError("reverification failed")
                self.recoveries += 1

            result = self._reserve

        self.last_recovery_ns = time.perf_counter_ns() - started
        return result

    def _inject_fault_for_test(self, strand: int = 0, offset: int = 0) -> None:
        """Test-only deterministic bit flip used by the fault-injection suite."""
        self._strands[strand][offset] ^= 1
