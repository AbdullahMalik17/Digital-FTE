import json
import os
import threading
from pathlib import Path
from typing import Any, Dict, Optional
import logging

logger = logging.getLogger("PersistentMemory")

class PersistentMemory:
    """
    Thread-safe persistent memory for the Cloud Agent.
    Stores key-value pairs in a JSON file backed by Git vault.
    """

    def __init__(self, vault_path: Path, filename: str = "agent_memory.json"):
        self.vault_path = vault_path
        self.memory_dir = self.vault_path / "memory"
        self.memory_file = self.memory_dir / filename
        self.data: Dict[str, Any] = {}
        self.lock = threading.RLock()
        
        self._ensure_storage()
        self.load()

    def _ensure_storage(self):
        """Ensure memory directory exists."""
        if not self.memory_dir.exists():
            try:
                self.memory_dir.mkdir(parents=True, exist_ok=True)
            except Exception as e:
                logger.error(f"Failed to create memory directory: {e}")

    def load(self):
        """Load memory from disk."""
        with self.lock:
            if self.memory_file.exists():
                try:
                    with open(self.memory_file, 'r', encoding='utf-8') as f:
                        self.data = json.load(f)
                    logger.info(f"Loaded persistent memory from {self.memory_file}")
                except Exception as e:
                    logger.error(f"Failed to load persistent memory: {e}")
                    # Backup corrupted file?
                    self.data = {}
            else:
                logger.info("No existing persistent memory found, starting fresh.")
                self.data = {}

    def save(self):
        """Save memory to disk."""
        with self.lock:
            try:
                # Atomically write to temp file then rename to avoid corruption
                temp_file = self.memory_file.with_suffix('.tmp')
                with open(temp_file, 'w', encoding='utf-8') as f:
                    json.dump(self.data, f, indent=2, ensure_ascii=False)
                
                temp_file.replace(self.memory_file)
                # logger.debug("Saved persistent memory.")
            except Exception as e:
                logger.error(f"Failed to save persistent memory: {e}")

    def get(self, key: str, default: Any = None) -> Any:
        """Get a value."""
        with self.lock:
            return self.data.get(key, default)

    def set(self, key: str, value: Any):
        """Set a value and save immediately."""
        with self.lock:
            self.data[key] = value
            self.save()

    def update(self, new_data: Dict[str, Any]):
        """Update multiple values and save."""
        with self.lock:
            self.data.update(new_data)
            self.save()
            
    def delete(self, key: str):
        """Delete a key."""
        with self.lock:
            if key in self.data:
                del self.data[key]
                self.save()
