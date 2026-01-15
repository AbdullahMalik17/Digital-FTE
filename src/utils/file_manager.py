"""
File Manager - Handle vault file operations
"""

import os
import shutil
import json
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any


class FileManager:
    """Manages file operations within the Obsidian vault."""

    def __init__(self, vault_path: Path):
        self.vault_path = vault_path
        self.inbox = vault_path / "Inbox"
        self.needs_action = vault_path / "Needs_Action"
        self.pending_approval = vault_path / "Pending_Approval"
        self.approved = vault_path / "Approved"
        self.done = vault_path / "Done"
        self.archive = vault_path / "Archive"
        self.logs = vault_path / "Logs"

        # Ensure all directories exist
        self._ensure_directories()

    def _ensure_directories(self):
        """Create all required directories."""
        for path in [self.inbox, self.needs_action, self.pending_approval,
                     self.approved, self.done, self.archive, self.logs]:
            path.mkdir(parents=True, exist_ok=True)

    def create_task_file(
        self,
        title: str,
        content: str,
        source: str,
        priority: str = "medium",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Path:
        """Create a new task file in Needs_Action folder."""
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M")
        safe_title = "".join(c if c.isalnum() or c in " -_" else "" for c in title)[:50]
        filename = f"{timestamp}_{source}_{priority}_{safe_title}.md"

        filepath = self.needs_action / filename

        # Build markdown content
        meta = metadata or {}
        md_content = f"""# {title}

## Metadata
- **Source:** {source}
- **Priority:** {priority.upper()}
- **Created:** {datetime.now().isoformat()}
{self._format_metadata(meta)}

---

## Content
{content}

---

## Actions
- [ ] Review task
- [ ] Process according to handbook
- [ ] Complete or escalate

---

## Notes
_Add notes here_

"""

        filepath.write_text(md_content, encoding='utf-8')
        return filepath

    def _format_metadata(self, meta: Dict[str, Any]) -> str:
        """Format metadata dict as markdown list."""
        lines = []
        for key, value in meta.items():
            lines.append(f"- **{key.replace('_', ' ').title()}:** {value}")
        return "\n".join(lines)

    def move_to_pending_approval(self, source_path: Path, reason: str = "") -> Path:
        """Move a file to Pending_Approval with approval request."""
        dest_path = self.pending_approval / source_path.name

        # Read original content
        content = source_path.read_text(encoding='utf-8')

        # Add approval request header
        approval_content = f"""---
**APPROVAL REQUIRED**
- **Moved:** {datetime.now().isoformat()}
- **Reason:** {reason or "Action requires human approval per handbook"}
- **Original Location:** {source_path}

**To Approve:** Move this file to `Vault/Approved/`
**To Reject:** Delete this file or move to `Vault/Archive/`
---

{content}
"""

        dest_path.write_text(approval_content, encoding='utf-8')
        source_path.unlink()  # Remove original

        return dest_path

    def move_to_done(self, source_path: Path, result: str = "completed") -> Path:
        """Move a file to Done folder with completion info."""
        dest_path = self.done / source_path.name

        # Read original content
        content = source_path.read_text(encoding='utf-8')

        # Add completion header
        done_content = f"""---
**COMPLETED**
- **Completed:** {datetime.now().isoformat()}
- **Result:** {result}
- **Original Location:** {source_path}
---

{content}
"""

        dest_path.write_text(done_content, encoding='utf-8')
        source_path.unlink()  # Remove original

        return dest_path

    def archive_old_files(self, days_old: int = 30):
        """Move files older than specified days to archive."""
        from datetime import timedelta

        cutoff = datetime.now() - timedelta(days=days_old)

        for file_path in self.done.glob("*.md"):
            if datetime.fromtimestamp(file_path.stat().st_mtime) < cutoff:
                dest = self.archive / file_path.name
                shutil.move(str(file_path), str(dest))

    def get_task_count(self) -> Dict[str, int]:
        """Get count of tasks in each folder."""
        return {
            "inbox": len(list(self.inbox.glob("*.md"))),
            "needs_action": len(list(self.needs_action.glob("*.md"))),
            "pending_approval": len(list(self.pending_approval.glob("*.md"))),
            "approved": len(list(self.approved.glob("*.md"))),
            "done": len(list(self.done.glob("*.md"))),
            "archive": len(list(self.archive.glob("*.md")))
        }
