import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from control_plane import AuditLedger, ControlPlane, NonceGuard, secure_token_configured


class ControlPlaneTests(unittest.TestCase):
    def test_initial_verification_passes(self):
        plane = ControlPlane()
        self.assertTrue(plane.verify()["passed"])
        self.assertEqual(plane.modules["sb699"].integration, "local")
        self.assertEqual(plane.modules["sb699"].health, "healthy")

    def test_checkpoint_requires_and_records_verification(self):
        plane = ControlPlane()
        result = plane.create_checkpoint()
        self.assertEqual(result["checkpoint"], 1)
        self.assertTrue(plane.ledger.verify())

    def test_external_blind_heal_is_refused(self):
        with self.assertRaises(RuntimeError):
            ControlPlane().heal("sb712")

    def test_local_heal_is_audited(self):
        plane = ControlPlane()
        plane.modules["control"].health = "degraded"
        self.assertEqual(plane.heal("control")["health"], "healthy")
        self.assertEqual(plane.ledger.entries()[-1]["event"], "module_healed")

    def test_ledger_detects_tamper(self):
        ledger = AuditLedger()
        ledger.append("x", "SYSTEM", {})
        ledger._entries[0]["detail"]["tampered"] = True
        self.assertFalse(ledger.verify())

    def test_nonce_replay_is_rejected(self):
        guard = NonceGuard()
        nonce = "a" * 32
        self.assertTrue(guard.accept(nonce))
        self.assertFalse(guard.accept(nonce))

    def test_weak_tokens_rejected(self):
        self.assertFalse(secure_token_configured("sb688"))
        self.assertTrue(secure_token_configured("x" * 32))


if __name__ == "__main__":
    unittest.main()
