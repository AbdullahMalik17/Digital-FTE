#!/usr/bin/env python3
"""Verify managing-calendar skill."""
import sys
from pathlib import Path

def verify():
    errors = []
    ROOT = Path(__file__).parent.parent.parent.parent.parent

    if not (ROOT / "config" / "credentials.json").exists():
        errors.append("Missing config/credentials.json")
    if not (ROOT / "src" / "mcp_servers" / "google_calendar_server.py").exists():
        errors.append("Missing src/mcp_servers/google_calendar_server.py")

    try:
        import fastmcp
    except ImportError:
        errors.append("Missing: fastmcp")

    if errors:
        print("[FAIL] managing-calendar invalid:")
        for e in errors: print(f"  - {e}")
        return 1
    print("[OK] managing-calendar valid")
    return 0

if __name__ == "__main__":
    sys.exit(verify())
