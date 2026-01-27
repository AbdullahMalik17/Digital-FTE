
import unittest
import os
import json
import time
from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.storage.json_db import JsonDB

class TestPersistence(unittest.TestCase):
    def setUp(self):
        self.db_name = "test_persistence_db"
        self.db_path = Path("Vault/Data") / f"{self.db_name}.json"
        
        # Cleanup
        if self.db_path.exists():
            os.remove(self.db_path)
            
    def tearDown(self):
        # Cleanup
        if self.db_path.exists():
            try:
                os.remove(self.db_path)
            except:
                pass
        # Cleanup backups
        for p in Path("Vault/Data").glob(f"{self.db_name}.bak.*"):
             try:
                os.remove(p)
             except:
                pass

    def test_basic_persistence(self):
        print("\nTesting Basic Persistence...")
        # 1. Write
        db1 = JsonDB(self.db_name)
        db1.set("foo", "bar")
        db1.set("count", 42)
        
        # 2. Reload
        print("Reloading DB...")
        db2 = JsonDB(self.db_name)
        self.assertEqual(db2.get("foo"), "bar")
        self.assertEqual(db2.get("count"), 42)
        print("Basic persistence verified.")

    def test_corruption_handling(self):
        print("\nTesting Corruption Handling...")
        # 1. Create valid DB
        db = JsonDB(self.db_name)
        db.set("status", "valid")
        path = db.file_path
        
        # 2. Corrupt it manually
        print(f"Corrupting {path}...")
        with open(path, "w") as f:
            f.write("{ invalid json [")
            
        # 3. Reload - should handle error and reset
        print("Reloading corrupted DB...")
        db_corrupt = JsonDB(self.db_name)
        
        # Should be empty dict (reset)
        self.assertEqual(db_corrupt.get("status"), None)
        print("Corrupted DB reset successfully.")
        
        # 4. Check for backup
        backups = list(Path("Vault/Data").glob(f"{self.db_name}.bak.*"))
        self.assertTrue(len(backups) > 0, "Backup file should exist")
        print(f"Backup found: {backups[0]}")

if __name__ == '__main__':
    unittest.main()
