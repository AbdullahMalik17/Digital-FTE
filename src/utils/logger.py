"""
Logging utilities for Digital FTE
"""

import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional


def setup_logger(
    name: str,
    log_dir: Optional[Path] = None,
    level: int = logging.INFO
) -> logging.Logger:
    """Set up a logger with console and file handlers."""

    logger = logging.getLogger(name)
    logger.setLevel(level)

    # Clear existing handlers
    logger.handlers = []

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(level)
    console_format = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    console_handler.setFormatter(console_format)
    logger.addHandler(console_handler)

    # File handler (if log_dir provided)
    if log_dir:
        log_dir.mkdir(parents=True, exist_ok=True)
        log_file = log_dir / f"{name}_{datetime.now().strftime('%Y-%m-%d')}.log"

        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setLevel(level)
        file_format = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        file_handler.setFormatter(file_format)
        logger.addHandler(file_handler)

    return logger


def log_action(
    log_dir: Path,
    action: str,
    actor: str,
    details: Dict[str, Any],
    result: str = "success"
):
    """Log an action to the daily JSON log file."""

    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "action": action,
        "actor": actor,
        "result": result,
        **details
    }

    log_file = log_dir / f"{datetime.now().strftime('%Y-%m-%d')}.json"

    # Load existing logs
    logs = []
    if log_file.exists():
        try:
            logs = json.loads(log_file.read_text(encoding='utf-8'))
        except json.JSONDecodeError:
            logs = []

    logs.append(log_entry)

    # Write updated logs
    log_file.write_text(json.dumps(logs, indent=2), encoding='utf-8')


class AuditLogger:
    """Structured audit logger for compliance."""

    def __init__(self, log_dir: Path):
        self.log_dir = log_dir
        self.log_dir.mkdir(parents=True, exist_ok=True)

    def log_email_action(
        self,
        action: str,
        sender: str,
        recipient: str,
        subject: str,
        approval_status: str,
        result: str
    ):
        """Log email-related action."""
        log_action(
            self.log_dir,
            action=f"email_{action}",
            actor="digital_fte",
            details={
                "sender": sender,
                "recipient": recipient,
                "subject": subject[:100],
                "approval_status": approval_status
            },
            result=result
        )

    def log_file_action(
        self,
        action: str,
        source_path: str,
        dest_path: str,
        result: str
    ):
        """Log file operation."""
        log_action(
            self.log_dir,
            action=f"file_{action}",
            actor="digital_fte",
            details={
                "source": source_path,
                "destination": dest_path
            },
            result=result
        )

    def log_approval_request(
        self,
        task_type: str,
        task_id: str,
        reason: str,
        risk_level: str
    ):
        """Log approval request."""
        log_action(
            self.log_dir,
            action="approval_requested",
            actor="digital_fte",
            details={
                "task_type": task_type,
                "task_id": task_id,
                "reason": reason,
                "risk_level": risk_level
            },
            result="pending"
        )

    def log_approval_granted(
        self,
        task_id: str,
        approver: str
    ):
        """Log approval granted."""
        log_action(
            self.log_dir,
            action="approval_granted",
            actor=approver,
            details={
                "task_id": task_id
            },
            result="approved"
        )
