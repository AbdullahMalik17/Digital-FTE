#!/usr/bin/env python3
"""
Simple runner for the API server.
Run with: python run_api.py
"""

import sys
import os
import logging
from pathlib import Path

# Add src to Python path
PROJECT_ROOT = Path(__file__).parent
SRC_DIR = PROJECT_ROOT / "src"
sys.path.insert(0, str(SRC_DIR))
sys.path.insert(0, str(PROJECT_ROOT))

# Route all logs to Vault/Logs/ — never to the repo root
LOG_DIR = PROJECT_ROOT / "Vault" / "Logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(name)s %(levelname)s %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(LOG_DIR / "api.log", encoding="utf-8"),
    ],
)

# Set working directory
os.chdir(SRC_DIR)

if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("API_PORT", 8000))

    print("=" * 50)
    print("Abdullah Junior API Server")
    print("=" * 50)
    print(f"Starting on http://localhost:{port}")
    print(f"Logs → {LOG_DIR / 'api.log'}")
    print("Press Ctrl+C to stop")
    print("=" * 50)

    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_config=None,   # use our logging config above
    )
