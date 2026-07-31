import tempfile
import unittest
from pathlib import Path

from SB699 import BraidRecoveryEngine, RecoveryError


class RecoveryTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.engine = BraidRecoveryEngine(Path(self.temp.name))

    def tearDown(self):
        self.temp.cleanup()

    def test_pre_reset_checkpoint_and_phoenix_setback(self):
        snap = self.engine.checkpoint_before_reset(b"trusted-memory")
        self.assertTrue(self.engine.authorize_reset(snap.snapshot_id)["authorized"])
        self.assertEqual(self.engine.phoenix_setback(snap.snapshot_id), b"trusted-memory")

    def test_tamper_blocks_reset_and_setback(self):
        snap = self.engine.checkpoint_before_reset(b"trusted-memory")
        target = Path(self.temp.name) / "phoenix_reserve" / snap.snapshot_id / "mirror.bin"
        target.write_bytes(b"corrupt")
        with self.assertRaises(RecoveryError):
            self.engine.authorize_reset(snap.snapshot_id)
        with self.assertRaises(RecoveryError):
            self.engine.phoenix_setback(snap.snapshot_id)

    def test_patrol_requires_all_three_strands_to_agree(self):
        good = {"live": b"x", "mirror": b"x", "witness": b"x"}
        self.assertTrue(self.engine.patrol(good)["passed"])
        good["witness"] = b"drift"
        self.assertFalse(self.engine.patrol(good)["passed"])

    def test_atmosphere_escalates_pressure(self):
        self.assertEqual(self.engine.atmosphere(memory_percent=40, disk_percent=50, heartbeat_age_s=1)["state"], "healthy")
        self.assertEqual(self.engine.atmosphere(memory_percent=91, disk_percent=50, heartbeat_age_s=1)["state"], "critical")


if __name__ == "__main__":
    unittest.main()
