import unittest
import os
import sys

# Add src to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

from bridges.go_bridge import MalikClawBridge

class TestMalikClawBridge(unittest.TestCase):

    def test_bridge_initialization(self):
        bridge = MalikClawBridge(base_url="http://localhost:18790")
        self.assertEqual(bridge.base_url, "http://localhost:18790")
        self.assertEqual(bridge.timeout, 10)

    def test_bridge_ping_fallback(self):
        bridge = MalikClawBridge(base_url="http://localhost:9999") # Non-existent port
        result = bridge.ping()
        self.assertFalse(result)

    def test_bridge_execute_task_fallback(self):
        bridge = MalikClawBridge(base_url="http://localhost:9999")
        res = bridge.execute_team_goal("Test task")
        self.assertIn("error", res)

if __name__ == "__main__":
    unittest.main()
