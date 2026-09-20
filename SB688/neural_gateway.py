"""SB688 neural-interface gateway.

Research/simulation architecture only.

SB688 sits between a neural interface and BCT/AI transport:
neural device <-> hardware safety boundary <-> SB688 integrity braid <-> BCT/AI

This module does NOT drive electrodes, generate stimulation waveforms, set charge,
voltage, current, pulse width, frequency, or bypass any medical-device interlock.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, Protocol

from .sovereign_braid import BraidFrame, IntegrityError, SovereignIntegrityBraid


class NeuralTransport(Protocol):
    """Opaque neural packet transport implemented by validated hardware/software."""

    def send(self, payload: bytes) -> None: ...


class NeuralSafetyError(RuntimeError):
    """Raised when the external hardware safety boundary refuses an operation."""


@dataclass(frozen=True)
class NeuralPacket:
    """Opaque neural data. No stimulation parameters are interpreted here."""

    channel: str
    payload: bytes
    writable: bool = False


class SB688NeuralGateway:
    """Bidirectional SB688 integrity gate for neural-interface data.

    READ PATH:
        neural interface -> external safety boundary -> SB688 -> BCT/AI

    WRITE PATH:
        BCT/AI -> SB688 -> external safety boundary -> neural interface

    The write path is disabled unless an independent hardware safety callback
    explicitly approves each packet.
    """

    __slots__ = (
        "braid",
        "_neural_tx",
        "_safety_gate",
        "_writes_enabled",
        "_max_packet_bytes",
    )

    def __init__(
        self,
        braid: SovereignIntegrityBraid,
        neural_transport: NeuralTransport,
        hardware_safety_gate: Callable[[NeuralPacket], bool],
        *,
        writes_enabled: bool = False,
        max_packet_bytes: int = 4096,
    ) -> None:
        if max_packet_bytes <= 0:
            raise ValueError("max_packet_bytes must be positive")

        self.braid = braid
        self._neural_tx = neural_transport
        self._safety_gate = hardware_safety_gate
        self._writes_enabled = writes_enabled
        self._max_packet_bytes = max_packet_bytes

    def _validate_packet(self, packet: NeuralPacket) -> None:
        if not packet.channel:
            raise IntegrityError("empty neural channel")
        if not packet.payload:
            raise IntegrityError("empty neural payload")
        if len(packet.payload) > self._max_packet_bytes:
            raise IntegrityError("neural packet exceeds configured bound")

    def neural_to_bct(self, packet: NeuralPacket) -> BraidFrame:
        """Integrity-gate opaque neural data before release toward BCT/AI."""
        self._validate_packet(packet)

        if packet.writable:
            raise NeuralSafetyError("inbound neural packet must be read-side data")

        if not self._safety_gate(packet):
            raise NeuralSafetyError("hardware safety boundary rejected neural read")

        return self.braid.transit(packet.channel, "A_TO_B", packet.payload)

    def bct_to_neural(self, frame: BraidFrame) -> None:
        """Integrity-gate outbound data, then require independent hardware approval."""
        if not self._writes_enabled:
            raise NeuralSafetyError("neural write path disabled")

        payload = self.braid.accept(frame)
        packet = NeuralPacket(channel=frame.channel, payload=payload, writable=True)
        self._validate_packet(packet)

        if not self._safety_gate(packet):
            raise NeuralSafetyError("hardware safety boundary rejected neural write")

        self._neural_tx.send(payload)

    @property
    def writes_enabled(self) -> bool:
        return self._writes_enabled
