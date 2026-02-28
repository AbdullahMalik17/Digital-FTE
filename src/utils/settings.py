"""
Startup settings validation using Pydantic BaseSettings.

Import and call `get_settings()` at application start to validate all
required environment variables before any service initialises.

Usage:
    from src.utils.settings import get_settings
    settings = get_settings()          # raises on missing/invalid values
    print(settings.odoo_url)
"""

from __future__ import annotations

import logging
import os
from enum import Enum
from functools import lru_cache
from pathlib import Path
from typing import Optional

try:
    from pydantic import field_validator, model_validator
    from pydantic_settings import BaseSettings, SettingsConfigDict

    _PYDANTIC_SETTINGS_AVAILABLE = True
except ImportError:
    _PYDANTIC_SETTINGS_AVAILABLE = False

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class WorkZone(str, Enum):
    CLOUD = "cloud"
    LOCAL = "local"


class LogLevel(str, Enum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


# ---------------------------------------------------------------------------
# Settings model (Pydantic v2)
# ---------------------------------------------------------------------------

if _PYDANTIC_SETTINGS_AVAILABLE:
    class Settings(BaseSettings):
        """
        Validated environment settings for Digital-FTE.

        All fields with defaults are optional at runtime.
        Fields without defaults must be present in the environment
        or a loaded .env file, or startup will fail with a clear error.
        """

        model_config = SettingsConfigDict(
            env_file=".env",
            env_file_encoding="utf-8",
            case_sensitive=False,
            extra="ignore",
        )

        # ── System ──────────────────────────────────────────────────────
        work_zone: WorkZone = WorkZone.LOCAL
        log_level: LogLevel = LogLevel.INFO
        vault_path: Path = Path("./Vault")
        api_port: int = 8000
        dry_run: bool = False

        # ── Odoo ────────────────────────────────────────────────────────
        odoo_url: str = "http://localhost:8069"
        odoo_db: str = "digital_fte"
        odoo_username: str = ""
        odoo_password: str = ""
        odoo_master_password: str = ""

        # ── Gmail ───────────────────────────────────────────────────────
        gmail_poll_interval: int = 60
        auto_reply_enabled: bool = True
        gmail_token_base64: Optional[str] = None

        # ── Telegram ────────────────────────────────────────────────────
        telegram_bot_token: Optional[str] = None
        telegram_chat_id: Optional[str] = None

        # ── Social Media ────────────────────────────────────────────────
        facebook_access_token: Optional[str] = None
        instagram_access_token: Optional[str] = None
        twitter_api_key: Optional[str] = None
        twitter_api_secret: Optional[str] = None
        twitter_access_token: Optional[str] = None
        twitter_access_secret: Optional[str] = None

        # ── Agents ──────────────────────────────────────────────────────
        agent_id: str = ""
        git_sync_interval: int = 30

        # ── Validators ──────────────────────────────────────────────────

        @field_validator("gmail_poll_interval")
        @classmethod
        def poll_interval_minimum(cls, v: int) -> int:
            if v < 10:
                raise ValueError("GMAIL_POLL_INTERVAL must be at least 10 seconds")
            return v

        @field_validator("git_sync_interval")
        @classmethod
        def sync_interval_minimum(cls, v: int) -> int:
            if v < 10:
                raise ValueError("GIT_SYNC_INTERVAL must be at least 10 seconds")
            return v

        @model_validator(mode="after")
        def warn_missing_credentials(self) -> "Settings":
            """Log warnings for empty credentials (not hard errors at startup)."""
            if self.work_zone == WorkZone.LOCAL:
                if not self.odoo_password:
                    logger.warning(
                        "ODOO_PASSWORD is not set — Odoo integration will be unavailable."
                    )
                if not self.odoo_username:
                    logger.warning(
                        "ODOO_USERNAME is not set — Odoo integration will be unavailable."
                    )
            return self

        def effective_vault_path(self) -> Path:
            """Return resolved absolute vault path."""
            return self.vault_path.resolve()

        def is_cloud(self) -> bool:
            return self.work_zone == WorkZone.CLOUD

        def is_local(self) -> bool:
            return self.work_zone == WorkZone.LOCAL


    @lru_cache(maxsize=1)
    def get_settings() -> Settings:
        """
        Return the validated settings singleton.

        Raises pydantic.ValidationError on the first call if any required
        variable is missing or invalid — giving a clear error at startup
        instead of a cryptic failure deep in the code.
        """
        return Settings()

else:
    # Fallback: pydantic-settings not installed; return plain dict wrapper
    class _FallbackSettings:  # type: ignore[no-redef]
        """Minimal fallback when pydantic-settings is unavailable."""

        def __init__(self):
            self.work_zone = os.getenv("WORK_ZONE", "local")
            self.log_level = os.getenv("LOG_LEVEL", "INFO")
            self.vault_path = Path(os.getenv("VAULT_PATH", "./Vault"))
            self.odoo_url = os.getenv("ODOO_URL", "http://localhost:8069")
            self.odoo_db = os.getenv("ODOO_DB", "digital_fte")
            self.odoo_username = os.getenv("ODOO_USERNAME", "")
            self.odoo_password = os.getenv("ODOO_PASSWORD", "")
            self.gmail_poll_interval = int(os.getenv("GMAIL_POLL_INTERVAL", "60"))
            self.dry_run = os.getenv("DRY_RUN", "false").lower() == "true"
            logger.warning(
                "pydantic-settings not installed; running without startup validation. "
                "Run: pip install pydantic-settings"
            )

        def is_cloud(self) -> bool:
            return self.work_zone == "cloud"

        def is_local(self) -> bool:
            return self.work_zone == "local"

    def get_settings() -> _FallbackSettings:  # type: ignore[misc]
        return _FallbackSettings()
