# Agent Enhancement - Architecture Plan

**Version:** 1.0
**Date:** 2026-01-23
**Status:** Approved
**Project:** Digital FTE - Agent Intelligence Upgrade

---

## Executive Summary

This plan outlines the comprehensive enhancement of Abdullah Junior from a reactive task executor into a proactive, intelligent, and agentic assistant that:
- **Anticipates** user needs before being asked
- **Decides** intelligently when to create specs vs execute directly
- **Controls** devices and services across mobile, laptop, and cloud
- **Learns** from user behavior and preferences over time
- **Creates** content and manages digital presence

---

## 1. Scope and Dependencies

### 1.1 In Scope

**Phase 1: Smart Communication** (Week 1)
- Daily digest with prioritized information
- Email auto-categorization
- Follow-up reminder system
- Email summarization

**Phase 2: Calendar & Multi-Platform Control** (Week 2)
- Deep Google Calendar integration
- Meeting detection from emails
- Multi-channel social posting
- Availability checker
- Mobile device control (Android/iOS)
- Laptop automation (Windows/Mac/Linux)

**Phase 3: Intelligence & Learning** (Week 3)
- Agentic Intelligence Layer (spec vs execute decision)
- Preference learning engine
- Workflow automation builder
- Contact intelligence
- Advanced analytics
- Writing style matching

**Phase 4: Creator & Entertainment** (Week 4)
- Spotify integration (playlists, recommendations)
- Content creation workflows
- Video/podcast management
- Creator analytics dashboard

### 1.2 Out of Scope

- Hardware control (smart home devices) - Future
- Voice cloning - Future
- Video editing automation - Future (Phase 5)
- Cryptocurrency trading - Explicitly excluded for safety

### 1.3 External Dependencies

| Dependency | Owner | Purpose | Status |
|-----------|-------|---------|--------|
| OpenAI/Claude API | Anthropic/OpenAI | AI reasoning | ✅ Active |
| Google Calendar API | Google | Calendar operations | ✅ Active |
| Gmail API | Google | Email operations | ✅ Active |
| Spotify API | Spotify | Music control | 🔄 Needed |
| Android Debug Bridge | Google | Mobile control | 🔄 Setup needed |
| Apple Shortcuts API | Apple | iOS control | 🔄 Setup needed |
| Social Media APIs | Meta, Twitter | Social posting | ✅ Active |
| Odoo API | Odoo | ERP integration | ✅ Active |

---

## 2. Key Architectural Decisions

### 2.1 Agentic Intelligence Layer

**Decision**: Create a meta-reasoning layer that decides task complexity before execution.

**Options Considered:**
1. **Always create specs** - Too slow, overkill for simple tasks
2. **Always execute directly** - Risky for complex tasks, no planning
3. **Hybrid: Intelligence layer decides** ✅ **CHOSEN**

**Rationale:**
- Simple tasks (< 3 steps, low risk) → Direct execution
- Complex tasks (>= 3 steps, high risk) → Spec-driven approach
- Uses LLM to analyze task complexity upfront
- Reduces latency for simple tasks while maintaining quality for complex ones

**Trade-offs:**
- ➕ Best of both worlds (speed + safety)
- ➕ User gets appropriate level of planning
- ➖ Adds meta-reasoning overhead (~1-2 seconds)
- ➖ Requires tuning of complexity thresholds

### 2.2 Multi-Platform Control Architecture

**Decision**: Use platform-specific automation bridges instead of unified abstraction.

**Options Considered:**
1. **Unified abstraction layer** - One API for all platforms
2. **Platform-specific bridges** ✅ **CHOSEN**
3. **Web-only control** - Limited capabilities

**Rationale:**
- Mobile platforms (Android/iOS) have fundamentally different APIs
- Native capabilities > web-based control
- Easier to maintain platform-specific code than leaky abstractions
- Can leverage platform-specific features (Android: Tasker, iOS: Shortcuts)

**Architecture:**
```
┌─────────────────────────────────────────────────────────────┐
│              Agentic Intelligence Layer                     │
│         (Decides: Spec vs Execute, Complexity)              │
└────────────────────┬────────────────────────────────────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
    ▼                ▼                ▼
┌─────────┐    ┌──────────┐    ┌──────────┐
│ Desktop │    │  Mobile  │    │  Cloud   │
│ Bridge  │    │  Bridge  │    │  Bridge  │
├─────────┤    ├──────────┤    ├──────────┤
│Windows  │    │ Android  │    │ Gmail    │
│ macOS   │    │   iOS    │    │ Calendar │
│ Linux   │    │          │    │ Spotify  │
│         │    │          │    │ Social   │
└─────────┘    └──────────┘    └──────────┘
```

### 2.3 Learning & Personalization

**Decision**: Local-first learning with encrypted preference store.

**Options Considered:**
1. **Cloud-based learning** - Privacy concerns, latency
2. **Local-first with sync** ✅ **CHOSEN**
3. **No learning** - Misses key value proposition

**Rationale:**
- User preferences are sensitive data
- Local storage = no privacy concerns
- Optional encrypted sync for multi-device
- Uses SQLite for structured queries
- Falls back gracefully if DB corrupted

**Schema:**
```sql
-- User preferences learned over time
CREATE TABLE user_preferences (
    id INTEGER PRIMARY KEY,
    category TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    confidence REAL DEFAULT 0.5,
    last_updated TIMESTAMP,
    source TEXT  -- 'explicit', 'observed', 'inferred'
);

-- Approval patterns
CREATE TABLE approval_patterns (
    id INTEGER PRIMARY KEY,
    action_type TEXT NOT NULL,
    context JSON,
    approved BOOLEAN,
    timestamp TIMESTAMP
);

-- Contact relationships
CREATE TABLE contact_intelligence (
    email TEXT PRIMARY KEY,
    name TEXT,
    relationship TEXT,
    importance_score REAL,
    last_interaction TIMESTAMP,
    communication_frequency INTEGER,
    topics JSON
);
```

### 2.4 Platform-Specific Integrations

#### 2.4.1 Mobile Control

**Android:**
- ADB (Android Debug Bridge) for programmatic control
- Termux for local execution
- Tasker integration for automation
- Accessibility services for UI interaction

**iOS:**
- Apple Shortcuts for automation
- SSH/Ish app for terminal access
- URL schemes for app launching
- Push notifications via APNS

#### 2.4.2 Laptop Automation

**Cross-platform:**
- Python automation scripts
- Keyboard/mouse control (PyAutoGUI)
- Window management (pygetwindow)
- Clipboard access (pyperclip)
- Screenshot capture (Pillow)

**Platform-specific:**
- Windows: PowerShell, Win32 APIs
- macOS: AppleScript, Automator
- Linux: bash, xdotool, wmctrl

#### 2.4.3 Spotify Integration

**Capabilities:**
- Playback control (play, pause, skip)
- Playlist management
- Mood-based recommendations
- Context-aware music (working, relaxing, focus)
- Discover Weekly analysis
- Podcast management

---

## 3. Interfaces and API Contracts

### 3.1 Agentic Intelligence Layer API

```python
class AgenticIntelligence:
    """
    Meta-reasoning layer that decides task approach.
    """

    def analyze_task(self, task: Task) -> TaskAnalysis:
        """
        Analyze task complexity and decide approach.

        Args:
            task: Task to analyze

        Returns:
            TaskAnalysis with:
            - complexity_score: 0-1 (simple to complex)
            - risk_score: 0-1 (low to high risk)
            - recommended_approach: 'direct' or 'spec_driven'
            - reasoning: str explaining decision
            - estimated_steps: int
        """

    def should_create_spec(self, analysis: TaskAnalysis) -> bool:
        """
        Decision: create spec or execute directly?

        Returns True if:
        - complexity_score >= 0.7
        - risk_score >= 0.6
        - estimated_steps >= 3
        - involves money or external communications
        """
```

### 3.2 Mobile Bridge API

```python
class MobileBridge:
    """Abstract base for mobile platform control."""

    async def send_notification(
        self,
        title: str,
        message: str,
        action_buttons: List[str] = None
    ) -> bool:
        """Send notification to mobile device."""

    async def open_app(self, app_identifier: str) -> bool:
        """Launch specific app."""

    async def execute_automation(
        self,
        automation_name: str,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Run pre-defined automation (Tasker/Shortcuts)."""

    async def get_location(self) -> Location:
        """Get current GPS coordinates."""

    async def set_reminder(
        self,
        title: str,
        time: datetime,
        recurrence: str = None
    ) -> bool:
        """Create system reminder."""
```

### 3.3 Desktop Automation API

```python
class DesktopBridge:
    """Cross-platform desktop control."""

    async def execute_command(
        self,
        command: str,
        shell: bool = True
    ) -> CommandResult:
        """Execute shell command."""

    async def open_application(self, app_name: str) -> bool:
        """Launch application by name."""

    async def type_text(self, text: str) -> bool:
        """Type text at current cursor position."""

    async def click(self, x: int, y: int) -> bool:
        """Click at screen coordinates."""

    async def take_screenshot(
        self,
        region: Tuple[int, int, int, int] = None
    ) -> bytes:
        """Capture screenshot."""

    async def get_active_window(self) -> WindowInfo:
        """Get info about currently focused window."""
```

### 3.4 Spotify API

```python
class SpotifyController:
    """Spotify integration for music control."""

    async def play(self, uri: str = None) -> bool:
        """Resume or play specific track/playlist."""

    async def pause(self) -> bool:
        """Pause playback."""

    async def skip_next(self) -> bool:
        """Skip to next track."""

    async def create_playlist(
        self,
        name: str,
        tracks: List[str],
        description: str = None
    ) -> Playlist:
        """Create new playlist."""

    async def get_mood_recommendations(
        self,
        mood: str,
        limit: int = 20
    ) -> List[Track]:
        """Get tracks for specific mood."""

    async def analyze_listening_habits(
        self,
        time_range: str = 'medium_term'
    ) -> ListeningAnalysis:
        """Analyze user's listening patterns."""
```

---

## 4. Non-Functional Requirements (NFRs)

### 4.1 Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| Task analysis latency | < 2 sec | 95th percentile |
| Direct execution start | < 5 sec | from task creation |
| Spec generation | < 30 sec | full spec document |
| Mobile command latency | < 3 sec | end-to-end |
| Desktop automation | < 1 sec | per action |
| Learning DB query | < 100 ms | any query |

### 4.2 Reliability

**SLOs (Service Level Objectives):**
- **Availability**: 99.9% uptime (< 9 hours downtime/year)
- **Task success rate**: 95% (excluding user rejection)
- **API error rate**: < 1% for external APIs
- **Crash recovery**: < 30 seconds restart time

**Error Budgets:**
- 43 minutes downtime per month
- 50 failed tasks per 1000
- 10 API failures per 1000 calls

**Degradation Strategy:**
- Mobile unreachable → Queue for later, notify user
- Spotify down → Skip music-related tasks, continue others
- LLM rate limit → Use fallback LLMs
- Local DB corrupt → Rebuild from audit logs

### 4.3 Security

**Authentication & Authorization:**
- All mobile devices registered with unique device ID
- OAuth 2.0 for cloud services (Google, Spotify)
- API keys stored in encrypted keyring
- Session tokens rotated every 24 hours
- 2FA required for sensitive operations

**Data Handling:**
- Preferences DB encrypted at rest (AES-256)
- API credentials never logged
- Audit logs exclude PII by default
- Mobile control requires device verification
- Rate limiting per device/service

**Secrets Management:**
```yaml
# Never commit these
config/.env:
  SPOTIFY_CLIENT_ID: secret
  SPOTIFY_CLIENT_SECRET: secret
  MOBILE_AUTH_TOKEN: secret
  DESKTOP_ENCRYPTION_KEY: secret
```

### 4.4 Compliance & Auditing

**Audit Trail Requirements:**
- Every mobile/desktop action logged with device ID
- Spotify listening data handled per GDPR
- Calendar data retention per user preference
- User can export all preferences
- Right to be forgotten (delete all data)

---

## 5. Data Management

### 5.1 Source of Truth

| Data Type | Primary Source | Backup | TTL |
|-----------|---------------|--------|-----|
| Tasks | Obsidian Vault | Git history | 30 days (archive) |
| User preferences | SQLite DB | Daily JSON export | Indefinite |
| Contact intelligence | SQLite DB | Vault markdown | Indefinite |
| Calendar events | Google Calendar | Local cache | 7 days sync |
| Spotify data | Spotify API | Local cache | 1 day |
| Mobile state | Device | None | Real-time |
| Audit logs | JSON files | Cloud backup | 90 days |

### 5.2 Schema Evolution

**Versioning Strategy:**
- Database migrations via Alembic
- Backward-compatible for 2 versions
- Forward migrations on startup
- Rollback support

**Migration Example:**
```python
# Migration: Add writing_style_profile to user_preferences
def upgrade():
    op.add_column('user_preferences',
        sa.Column('writing_style_profile', sa.JSON, nullable=True)
    )

def downgrade():
    op.drop_column('user_preferences', 'writing_style_profile')
```

### 5.3 Data Retention

**Retention Policies:**
- Tasks: Archive after 30 days, delete after 1 year
- Preferences: Keep indefinitely, user can reset
- Audit logs: 90 days rolling window
- Caches: 1-7 days depending on data type
- Spotify history: 6 months for recommendations

---

## 6. Operational Readiness

### 6.1 Observability

**Logs:**
```json
{
  "timestamp": "2026-01-23T10:30:00Z",
  "level": "INFO",
  "component": "agentic_intelligence",
  "action": "task_analysis",
  "task_id": "task_123",
  "complexity_score": 0.8,
  "recommended_approach": "spec_driven",
  "reasoning": "Multi-step with external API calls",
  "duration_ms": 1234
}
```

**Metrics (Prometheus-style):**
```
# Task complexity distribution
task_complexity_score_bucket{le="0.3"} 120
task_complexity_score_bucket{le="0.7"} 85
task_complexity_score_bucket{le="1.0"} 45

# Approach decisions
approach_decision_total{approach="direct"} 180
approach_decision_total{approach="spec_driven"} 70

# Mobile commands
mobile_command_total{platform="android",status="success"} 450
mobile_command_total{platform="ios",status="success"} 320
mobile_command_duration_seconds{platform="android"} 2.3
```

**Traces:**
- OpenTelemetry integration
- Distributed tracing for multi-step tasks
- Span per external API call
- Performance profiling

### 6.2 Alerting

**Critical Alerts** (Page on-call):
- Agent crashes > 3 times in 1 hour
- Mobile control failure rate > 10%
- Database corruption detected
- Security breach detected

**Warning Alerts** (Slack notification):
- Task success rate < 90%
- Latency p95 > 5 seconds
- Disk space < 20%
- API rate limits hit

### 6.3 Runbooks

**Common Operations:**

1. **Reset User Preferences**
   ```bash
   python -m src.utils.reset_preferences --user=<id> --confirm
   ```

2. **Register New Mobile Device**
   ```bash
   python -m src.mobile.register_device \
     --platform=android \
     --device-id=<id> \
     --auth-token=<token>
   ```

3. **Rebuild Learning Database**
   ```bash
   python -m src.intelligence.rebuild_db \
     --from-audit-logs \
     --start-date=2026-01-01
   ```

### 6.4 Deployment Strategy

**Rolling Deployment:**
```
1. Deploy new version to staging environment
2. Run integration tests (30 minutes)
3. Deploy to 10% of production (canary)
4. Monitor for 1 hour
5. If success rate >= 95%, deploy to 100%
6. If failure, automatic rollback
```

**Feature Flags:**
```python
FEATURE_FLAGS = {
    "agentic_intelligence": True,
    "mobile_control_android": True,
    "mobile_control_ios": False,  # Coming soon
    "spotify_integration": True,
    "learning_engine": True,
    "advanced_analytics": False,  # Phase 3
}
```

---

## 7. Risk Analysis

| Risk | Probability | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| **Mobile control security breach** | Low | Critical | Device registration, 2FA, rate limiting | Security Team |
| **LLM hallucination in task analysis** | Medium | High | Multiple validation checks, user confirmation for risky tasks | AI Team |
| **Spotify API rate limits** | Medium | Medium | Caching, request batching, fallback to manual | Integration Team |
| **Preference learning wrong patterns** | Medium | Medium | Confidence scoring, user override, reset option | ML Team |
| **Desktop automation breaking OS updates** | High | Medium | Version-specific adapters, graceful degradation | Platform Team |
| **Database corruption** | Low | High | Daily backups, rebuild from audit logs | Ops Team |
| **Cross-device sync conflicts** | Medium | Low | Last-write-wins with conflict detection | Sync Team |

**Blast Radius Control:**
- Mobile commands limited to 10/minute per device
- Spotify API calls < 100/hour
- Desktop automation requires user presence detection
- Kill switch per feature flag
- Automatic rollback on error rate spike

---

## 8. Evaluation and Validation

### 8.1 Definition of Done

**Phase 1 (Smart Communication):**
- [ ] Daily digest sent reliably at configured time
- [ ] Email categorization accuracy >= 85%
- [ ] Follow-up reminders working
- [ ] All P0 features deployed

**Phase 2 (Multi-Platform Control):**
- [ ] Mobile control working on Android
- [ ] Calendar integration complete
- [ ] Spotify playback control working
- [ ] Desktop automation for common tasks
- [ ] Multi-channel social posting

**Phase 3 (Intelligence & Learning):**
- [ ] Agentic Intelligence Layer deployed
- [ ] Learning engine captures preferences
- [ ] Contact intelligence enriched
- [ ] Writing style matching working
- [ ] Auto-approval rate >= 70%

### 8.2 Output Validation

**Automated Tests:**
```python
# Task analysis validation
def test_agentic_analysis():
    # Simple task should recommend direct execution
    simple_task = Task(description="Send email to John")
    analysis = intelligence.analyze_task(simple_task)
    assert analysis.recommended_approach == "direct"
    assert analysis.complexity_score < 0.5

    # Complex task should recommend spec-driven
    complex_task = Task(description="Build multi-step payment flow")
    analysis = intelligence.analyze_task(complex_task)
    assert analysis.recommended_approach == "spec_driven"
    assert analysis.complexity_score >= 0.7
```

**User Acceptance Testing:**
- Beta test with 5 users for 1 week
- Collect feedback via daily surveys
- Measure: task success rate, user satisfaction, time saved
- Target: 4.5/5 satisfaction, 80%+ time savings

---

## 9. Architecture Decision Records (ADRs)

### ADR-001: Agentic Intelligence Layer

**Context:** Need to balance speed (direct execution) with safety/quality (spec-driven approach).

**Decision:** Implement meta-reasoning layer that analyzes task complexity before deciding approach.

**Consequences:**
- ➕ Optimal balance of speed and quality
- ➕ User gets appropriate level of planning
- ➕ Can tune thresholds based on feedback
- ➖ Adds 1-2 seconds latency per task
- ➖ Requires maintenance of classification model

### ADR-002: Local-First Learning

**Context:** User preferences contain sensitive data. Options: cloud-based, local-only, or hybrid.

**Decision:** Local-first with encrypted database, optional cloud sync.

**Consequences:**
- ➕ Privacy-preserving
- ➕ Fast queries (no network)
- ➕ Works offline
- ➖ No multi-device sync by default
- ➖ User responsible for backups

### ADR-003: Platform-Specific Bridges

**Context:** Need to control multiple platforms (Android, iOS, Desktop). Options: unified abstraction vs platform-specific.

**Decision:** Platform-specific bridges, no unified abstraction.

**Consequences:**
- ➕ Can leverage platform-specific features
- ➕ Easier to maintain
- ➕ Better error handling
- ➖ More code to write
- ➖ No code reuse across platforms

---

## 10. Timeline & Milestones

```
Week 1: Smart Communication (Phase 1)
├── Day 1-2: Daily Digest + Email Categorization
├── Day 3-4: Follow-up Tracker
├── Day 5: Email Summarization
└── Day 6-7: Testing & Refinement

Week 2: Multi-Platform Control (Phase 2)
├── Day 1-2: Calendar Integration + Meeting Detection
├── Day 3: Mobile Control (Android)
├── Day 4: Desktop Automation
├── Day 5: Spotify Integration
└── Day 6-7: Testing & Refinement

Week 3: Intelligence & Learning (Phase 3)
├── Day 1-2: Agentic Intelligence Layer
├── Day 3-4: Preference Learning Engine
├── Day 5: Contact Intelligence
├── Day 6: Writing Style Matching
└── Day 7: Testing & Refinement

Week 4: Polish & Creator Features
├── Day 1-2: Advanced Analytics
├── Day 3-4: Creator Workflow Tools
├── Day 5-6: Performance Optimization
└── Day 7: Final Testing & Documentation
```

---

## 11. Approval

**Technical Review:**
- [x] Architecture sound and scalable
- [x] Security considerations addressed
- [x] Performance targets achievable
- [x] Monitoring and observability planned

**User Acceptance:**
- [x] Feature set aligns with user needs
- [x] Complexity vs value trade-off acceptable
- [x] Privacy concerns addressed

**Ready for Implementation:** ✅ **APPROVED**

---

**Next Steps:**
1. Review Phase 2 detailed spec: `phase2/spec.md`
2. Review Phase 3 detailed spec: `phase3/spec.md`
3. Review Agentic Intelligence Layer spec: `agentic-intelligence/spec.md`
4. Start implementation with Phase 1

**Estimated Total Effort:** 60-80 hours
**Target Completion:** 4 weeks
