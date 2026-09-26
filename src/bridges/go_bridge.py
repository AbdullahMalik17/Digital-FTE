import json
import logging
import urllib.request
import urllib.error
from typing import Dict, Any, Optional

logger = logging.getLogger("malikclaw_bridge")

class MalikClawBridge:
    """Python bridge client connecting Digital-FTE to MalikClaw's Go engine."""

    def __init__(self, base_url: str = "http://localhost:18790", timeout: int = 10):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    def ping(self) -> bool:
        """Check if MalikClaw engine is active."""
        try:
            req = urllib.request.Request(f"{self.base_url}/swarm/ping", method="GET")
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode("utf-8"))
                    return data.get("status") == "ok"
        except Exception as e:
            logger.debug(f"MalikClaw engine ping failed: {e}")
        return False

    def execute_team_goal(self, goal: str, team: str = "large-codebase-team") -> Dict[str, Any]:
        """Dispatch a goal to MalikClaw's Go DAG multi-agent team engine."""
        payload = json.dumps({"goal": goal, "team": team}).encode("utf-8")
        headers = {"Content-Type": "application/json"}

        try:
            req = urllib.request.Request(
                f"{self.base_url}/swarm/task",
                data=payload,
                headers=headers,
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                res_bytes = resp.read()
                return json.loads(res_bytes.decode("utf-8"))
        except urllib.error.HTTPError as e:
            logger.error(f"MalikClaw task dispatch returned HTTP {e.code}: {e.read().decode('utf-8')}")
            return {"error": f"HTTP {e.code}"}
        except Exception as e:
            logger.error(f"Failed to dispatch goal to MalikClaw: {e}")
            return {"error": str(e)}
