"""Thin BCT connector for the SB688 sovereign integrity braid.

BCT owns transport/topology.
SB688 owns verification and healing.

The adapter deliberately knows nothing about storage, UI, policy, databases,
or the physical transport used by BCT.
"""

from __future__ import annotations

from collections.abc import Callable

from .sovereign_braid import BraidFrame, SovereignIntegrityBraid


class BCTIntegrityAddon:
    """Attach SB688 verification/healing to a bidirectional BCT channel."""

    __slots__ = ("braid", "_send")

    def __init__(
        self,
        braid: SovereignIntegrityBraid,
        send_func: Callable[[BraidFrame], None],
    ) -> None:
        self.braid = braid
        self._send = send_func

    def send_a_to_b(self, channel: str, payload: bytes) -> BraidFrame:
        frame = self.braid.transit(channel, "A_TO_B", payload)
        self._send(frame)
        return frame

    def send_b_to_a(self, channel: str, payload: bytes) -> BraidFrame:
        frame = self.braid.transit(channel, "B_TO_A", payload)
        self._send(frame)
        return frame

    def receive(self, frame: BraidFrame) -> bytes:
        return self.braid.accept(frame)
