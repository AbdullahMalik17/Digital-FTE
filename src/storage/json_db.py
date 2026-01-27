import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional

class JsonDB:
    """
    Simple JSON-based database for local persistence.
    Stores data in Vault/Data directory.
    """
    
    def __init__(self, db_name: str, base_dir: str = "Vault/Data"):
        """
        Initialize database.
        
        Args:
            db_name: Name of the database (filename without extension)
            base_dir: Base directory for storage
        """
        self.db_name = db_name
        self.base_dir = Path(base_dir)
        self.file_path = self.base_dir / f"{db_name}.json"
        
        # Ensure directory exists
        self.base_dir.mkdir(parents=True, exist_ok=True)
        
        # Load or initialize data
        self.data = self._load_data()
        
    def _load_data(self) -> Dict:
        """Load data from JSON file with backup for corruption."""
        if not self.file_path.exists():
            return {}
            
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except json.JSONDecodeError:
            print(f"[JsonDB] Error decoding {self.db_name}. Creating backup and resetting.")
            # Backup corrupted file
            backup_path = self.file_path.with_suffix(f".bak.{int(datetime.now().timestamp())}")
            try:
                self.file_path.rename(backup_path)
                print(f"[JsonDB] Corrupted file backed up to {backup_path}")
            except Exception as e:
                print(f"[JsonDB] Failed to backup corrupted file: {e}")
            return {}
        except Exception as e:
            print(f"[JsonDB] Error loading {self.db_name}: {e}")
            return {}
            
    def _save_data(self):
        """Save data to JSON file atomically."""
        temp_path = self.file_path.with_suffix(".tmp")
        try:
            with open(temp_path, 'w', encoding='utf-8') as f:
                json.dump(self.data, f, indent=2, default=str)
            
            # Atomic replace (Windows supports this in recent versions, or use os.replace)
            # Path.replace calls replace on POSIX and replace (with overwrite) on Windows 3.8+
            temp_path.replace(self.file_path)
        except Exception as e:
            print(f"[JsonDB] Error saving {self.db_name}: {e}")
            if temp_path.exists():
                try:
                    temp_path.unlink()
                except:
                    pass
            
    def get(self, key: str, default: Any = None) -> Any:
        """Get value by key."""
        return self.data.get(key, default)
        
    def set(self, key: str, value: Any):
        """Set value for key and save."""
        self.data[key] = value
        self._save_data()
        
    def delete(self, key: str):
        """Delete key and save."""
        if key in self.data:
            del self.data[key]
            self._save_data()
            
    def get_all(self) -> Dict:
        """Get all data."""
        return self.data.copy()
        
    def clear(self):
        """Clear all data."""
        self.data = {}
        self._save_data()
        
    def upsert_item_in_list(self, list_key: str, item: Dict, id_key: str = 'id'):
        """
        Update or insert an item in a list stored under list_key.
        """
        current_list = self.data.get(list_key, [])
        if not isinstance(current_list, list):
            current_list = []
            
        # Check if item exists
        existing_index = -1
        for i, existing in enumerate(current_list):
            if isinstance(existing, dict) and existing.get(id_key) == item.get(id_key):
                existing_index = i
                break
                
        if existing_index >= 0:
            current_list[existing_index] = item
        else:
            current_list.append(item)
            
        self.set(list_key, current_list)
