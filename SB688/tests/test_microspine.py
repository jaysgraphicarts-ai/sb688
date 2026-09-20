import unittest

from SB688 import FastBraidLane, FastRecoveryError


class FastBraidLaneTests(unittest.TestCase):
    def test_clean_state_verifies(self):
        lane = FastBraidLane(b"certified")
        self.assertTrue(lane.verify())
        self.assertEqual(lane.recover(), b"certified")

    def test_single_strand_fault_self_heals(self):
        lane = FastBraidLane(b"certified")
        lane._inject_fault_for_test(1, 0)
        self.assertFalse(lane.verify())
        self.assertEqual(lane.recover(), b"certified")
        self.assertTrue(lane.verify())
        self.assertEqual(lane.recoveries, 1)

    def test_all_working_strands_restore_from_certified_reserve(self):
        lane = FastBraidLane(b"certified")
        for strand in range(3):
            lane._inject_fault_for_test(strand, 0)
        self.assertEqual(lane.recover(), b"certified")
        self.assertTrue(lane.verify())

    def test_empty_state_fails_closed(self):
        with self.assertRaises(FastRecoveryError):
            FastBraidLane(b"")

    def test_reserve_corruption_fails_closed(self):
        lane = FastBraidLane(b"certified")
        lane._reserve = b"corrupt"
        with self.assertRaises(FastRecoveryError):
            lane.recover()


if __name__ == "__main__":
    unittest.main()
