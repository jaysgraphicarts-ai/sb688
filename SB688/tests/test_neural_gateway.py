import unittest

from SB688.neural_gateway import (
    NeuralPacket,
    NeuralSafetyError,
    SB688NeuralGateway,
)
from SB688.sovereign_braid import SovereignIntegrityBraid


class FakeNeuralTransport:
    def __init__(self):
        self.sent = []

    def send(self, payload: bytes) -> None:
        self.sent.append(payload)


class NeuralGatewayTests(unittest.TestCase):
    def setUp(self):
        self.braid = SovereignIntegrityBraid(b"certified-state")
        self.transport = FakeNeuralTransport()
        self.allow = lambda packet: True

    def test_read_path_is_bidirectionally_integrity_gated(self):
        gateway = SB688NeuralGateway(
            self.braid,
            self.transport,
            self.allow,
        )
        frame = gateway.neural_to_bct(
            NeuralPacket(channel="motor-cortex-read", payload=b"opaque-neural-data")
        )
        self.assertEqual(self.braid.accept(frame), b"opaque-neural-data")

    def test_write_path_is_off_by_default(self):
        gateway = SB688NeuralGateway(
            self.braid,
            self.transport,
            self.allow,
        )
        frame = self.braid.transit("neural-write", "B_TO_A", b"opaque-command")
        with self.assertRaises(NeuralSafetyError):
            gateway.bct_to_neural(frame)
        self.assertEqual(self.transport.sent, [])

    def test_write_requires_independent_safety_approval(self):
        gateway = SB688NeuralGateway(
            self.braid,
            self.transport,
            lambda packet: False,
            writes_enabled=True,
        )
        frame = self.braid.transit("neural-write", "B_TO_A", b"opaque-command")
        with self.assertRaises(NeuralSafetyError):
            gateway.bct_to_neural(frame)
        self.assertEqual(self.transport.sent, [])

    def test_approved_write_reaches_only_opaque_transport(self):
        gateway = SB688NeuralGateway(
            self.braid,
            self.transport,
            self.allow,
            writes_enabled=True,
        )
        frame = self.braid.transit("neural-write", "B_TO_A", b"opaque-command")
        gateway.bct_to_neural(frame)
        self.assertEqual(self.transport.sent, [b"opaque-command"])

    def test_fault_self_heals_before_neural_read_release(self):
        gateway = SB688NeuralGateway(
            self.braid,
            self.transport,
            self.allow,
        )
        self.braid.inject_test_fault(2, 0)
        frame = gateway.neural_to_bct(
            NeuralPacket(channel="neural-read", payload=b"sample")
        )
        self.assertEqual(self.braid.accept(frame), b"sample")
        self.assertTrue(self.braid.verify())


if __name__ == "__main__":
    unittest.main()
