#!/usr/bin/env python3
"""Verify managing-odoo skill."""
import os
import sys
from pathlib import Path

def verify():
    errors = []
    ROOT = Path(__file__).parent.parent.parent.parent.parent

    # Check MCP server exists
    if not (ROOT / "src" / "mcp_servers" / "odoo_server.py").exists():
        errors.append("Missing src/mcp_servers/odoo_server.py")

    # Check required environment variables
    required_env = ["ODOO_URL", "ODOO_DB", "ODOO_USERNAME", "ODOO_PASSWORD"]

    # Load .env if exists
    env_file = ROOT / ".env"
    if env_file.exists():
        with open(env_file) as f:
            for line in f:
                if "=" in line and not line.strip().startswith("#"):
                    key = line.split("=")[0].strip()
                    if key in required_env:
                        required_env.remove(key)

    for var in required_env:
        if not os.getenv(var):
            errors.append(f"Missing env: {var}")

    # Check dependencies
    try:
        import fastmcp
    except ImportError:
        errors.append("Missing: fastmcp")

    if errors:
        print("[FAIL] managing-odoo invalid:")
        for e in errors: print(f"  - {e}")
        return 1
    print("[OK] managing-odoo valid")
    return 0

if __name__ == "__main__":
    sys.exit(verify())
