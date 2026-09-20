import unittest

from SB688.bct_adapter import BCTIntegrityAddon
from SB688.sovereign_braid import (
    BraidFrame,
    IntegrityError,
    SovereignIntegrityBraid,
)


class SovereignIntegrityBraidTests(unittest.TestCase):
    def setUp(self):
        self.braid = SovereignIntegrityBraid(b"certified-state")

    def test_clean_braid_verifies(self):
        self.assertTrue(self.braid.verify())

    def test_a_to_b_and_b_to_a_use_same_gate(self):
        a = self.braid.transit("bct-0", "A_TO_B", b"left")
        b = self.braid.transit("bct-0", "B_TO_A", b"right")
        self.assertEqual(self.braid.accept(a), b"left")
        self.assertEqual(self.braid.accept(b), b"right")

    def test_fault_is_healed_before_transit(self):
        self.braid.inject_test_fault(1, 0)
        self.assertFalse(self.braid.verify())
        frame = self.braid.transit("bct-0", "A_TO_B", b"payload")
        self.assertEqual(self.braid.accept(frame), b"payload")
        self.assertTrue(self.braid.verify())
        self.assertEqual(self.braid.recoveries, 1)

    def test_all_working_strands_can_restore_from_certified_reserve(self):
        for strand in range(3):
            self.braid.inject_test_fault(strand, 0)
        self.assertTrue(self.braid.heal())
        self.assertTrue(self.braid.verify())

    def test_corrupt_frame_fails_closed(self):
        frame = self.braid.transit("bct-0", "A_TO_B", b"trusted")
        corrupt = BraidFrame(
            channel=frame.channel,
            direction=frame.direction,
            sequence=frame.sequence,
            payload=b"tampered",
            payload_hash=frame.payload_hash,
            created_ns=frame.created_ns,
        )
        with self.assertRaises(IntegrityError):
            self.braid.accept(corrupt)

    def test_corrupt_certified_reserve_fails_closed(self):
        self.braid._certified = b"corrupt"
        self.braid.inject_test_fault(0, 0)
        with self.assertRaises(IntegrityError):
            self.braid.heal()

    def test_bct_adapter_is_transport_only(self):
        sent = []
        addon = BCTIntegrityAddon(self.braid, sent.append)
        left = addon.send_a_to_b("bct-0", b"alpha")
        right = addon.send_b_to_a("bct-0", b"beta")
        self.assertEqual(sent, [left, right])
        self.assertEqual(addon.receive(left), b"alpha")
        self.assertEqual(addon.receive(right), b"beta")


if __name__ == "__main__":
    unittest.main()
