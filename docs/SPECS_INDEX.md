# Digital FTE Feature Specs - Master Index

**Created**: 2026-01-15  
**Status**: Draft Specifications Ready for Planning  
**Next Step**: Run `/sp.plan` for each spec to generate implementation plans

---

## Overview

Five feature specifications have been created following SpecifyPlus structure. Each spec includes:
- User scenarios (P1/P2/P3 priorities)
- Acceptance criteria (Given/When/Then format)
- Functional requirements
- Key entities
- Success criteria

---

## Feature Specs

### 1. ✅ Laptop Startup/Reload (`001-laptop-startup-spec.md`)

**Priority**: CRITICAL (enables all other features)  
**Effort**: 4-6 hours  
**Score**: 7.0/10

**User Stories**:
- US1 (P1): Auto-start on login
- US2 (P2): Crash recovery
- US3 (P2): Graceful shutdown
- US4 (P3): Cross-platform support

**Success Criteria**:
- 99% uptime
- <30 second startup
- Auto-recovery in <60 seconds

---

### 2. ✅ Email Sender MCP (`002-email-sender-mcp-spec.md`)

**Priority**: HIGH (closes perception→action loop)  
**Effort**: 8-12 hours  
**Score**: 6.6/10

**User Stories**:
- US1 (P1): Send email via MCP
- US2 (P2): Template-based sending
- US3 (P1): Approval workflow

**Success Criteria**:
- 100% delivery accuracy
- <5 second send latency
- Zero unintended sends

---

### 3. ✅ Filesystem Watcher (`003-filesystem-watcher-spec.md`)

**Priority**: HIGH (multi-source perception)  
**Effort**: 8-10 hours  
**Score**: 6.6/10

**User Stories**:
- US1 (P1): Detect new files
- US2 (P1): Categorize and suggest actions
- US3 (P1): Rate limiting and debouncing
- US4 (P1): Safety (never auto-delete)

**Success Criteria**:
- <10 second latency
- 100% deduplication
- Zero unintended deletions

---

### 4. ✅ Weekly CEO Briefing (`004-ceo-briefing-spec.md`)

**Priority**: MEDIUM (reporting/analytics)  
**Effort**: 6-8 hours  
**Score**: 6.2/10

**User Stories**:
- US1 (P1): Generate weekly briefing
- US2 (P1): Compute metrics and value
- US3 (P2): Scheduled generation
- US4 (P2): Highlight key decisions

**Success Criteria**:
- 100% metric accuracy
- <5 minute generation
- Professional quality output

---

### 5. ✅ WhatsApp Watcher (`005-whatsapp-watcher-spec.md`)

**Priority**: MEDIUM (multi-channel communication)  
**Effort**: 10-14 hours  
**Score**: 5.2/10

**User Stories**:
- US1 (P1): Detect new messages
- US2 (P1): Identify contacts
- US3 (P2): Auto-reply to known contacts
- US4 (P2): Escalate sensitive messages

**Success Criteria**:
- <30 second detection
- 100% contact classification
- Zero inappropriate replies

---

## Recommended Implementation Sequence

### Sprint 1 (Weeks 1-2) - Foundation: 10-18 hours
1. **001-laptop-startup** (4-6 hours)
   - Unblocks all other features
   - Enable 24/7 continuous operation
   
2. **002-email-sender-mcp** (8-12 hours)
   - Closes the action loop
   - Enables closed-loop email automation

**Checkpoint**: Both features working together = perception→reasoning→action loop complete

---

### Sprint 2 (Weeks 3-4) - Expansion: 14-18 hours
3. **003-filesystem-watcher** (8-10 hours)
   - Multi-source perception
   - Extends FTE capabilities beyond email
   
4. **004-ceo-briefing** (6-8 hours)
   - Demonstrates value through metrics
   - Enables leadership oversight

**Checkpoint**: FTE now monitors 2 sources and generates reports

---

### Sprint 3 (Weeks 5+) - Advanced: 10-14 hours
5. **005-whatsapp-watcher** (10-14 hours)
   - Multi-channel communication
   - Most complex watcher implementation

**Checkpoint**: FTE operates across 3 channels

---

## Dependency Graph

```
001-laptop-startup ─→ UNBLOCKS ALL
    ├─→ 002-email-sender-mcp (Email action layer)
    │   └─→ 004-ceo-briefing (Uses email to distribute)
    │
    ├─→ 003-filesystem-watcher (File monitoring)
    │
    └─→ 005-whatsapp-watcher (Message monitoring)
```

---

## Next Steps

### Immediate (Today)
- [ ] Review all 5 feature specs
- [ ] Confirm feature selection for Sprint 1
- [ ] Confirm target platform (Windows/macOS/Linux)

### Short-term (This Week)
- [ ] Run `/sp.plan 001-laptop-startup` → generates plan.md, research.md, data-model.md
- [ ] Run `/sp.plan 002-email-sender-mcp` → generates detailed implementation plan
- [ ] Create data models and API contracts for both

### Medium-term (Next 2 Weeks)
- [ ] Run `/sp.tasks 001-laptop-startup` → generates testable tasks
- [ ] Run `/sp.tasks 002-email-sender-mcp` → generates testable tasks
- [ ] Begin implementation with TDD (tests first)

### Long-term (4+ Weeks)
- [ ] Complete Sprint 1 (Startup + Email MCP)
- [ ] Validate with real workflows
- [ ] Plan and execute Sprint 2 & 3

---

## Technical Context (Cross-Feature)

**Language**: Python 3.10+  
**Primary Dependencies**: watchdog, google-api-client, playwright, fastmcp  
**Storage**: Markdown files (Obsidian vault)  
**Testing**: pytest  
**Target Platform**: Windows, macOS, Linux (platform-agnostic)

---

## Quick Reference

| Spec | File | Priority | Hours | Status |
|------|------|----------|-------|--------|
| Laptop Startup | 001-laptop-startup-spec.md | CRITICAL | 4-6 | Draft ✅ |
| Email Sender MCP | 002-email-sender-mcp-spec.md | HIGH | 8-12 | Draft ✅ |
| Filesystem Watcher | 003-filesystem-watcher-spec.md | HIGH | 8-10 | Draft ✅ |
| CEO Briefing | 004-ceo-briefing-spec.md | MEDIUM | 6-8 | Draft ✅ |
| WhatsApp Watcher | 005-whatsapp-watcher-spec.md | MEDIUM | 10-14 | Draft ✅ |

---

## SpecifyPlus Workflow

To create detailed implementation plans from these specs:

```bash
# Generate implementation plan for feature 1
/sp.plan 001-laptop-startup

# This creates:
# - plan.md (architecture and design decisions)
# - research.md (findings from investigation)
# - data-model.md (entities and relationships)
# - contracts/ (API contracts if applicable)

# Then generate implementation tasks:
/sp.tasks 001-laptop-startup

# This creates:
# - tasks.md (broken down into testable chunks by user story)
```

---

**Ready for**: Feature planning and implementation sequencing  
**Created by**: Digital FTE Planning Session  
**Date**: 2026-01-15
