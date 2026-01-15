# Feature Specification: Digital FTE Silver Tier Upgrade

**Feature Branch**: `001-silver-tier-upgrade`
**Created**: 2026-01-15
**Status**: Draft
**Input**: Adding WhatsApp Watcher, Filesystem Watcher, Email Sender MCP, Weekly CEO Briefing, and Auto-start on laptop boot

## Overview

This specification defines the upgrade from Bronze to Silver tier for the Digital FTE system, adding multiple perception channels (WhatsApp, Filesystem), action capabilities (Email Sender MCP), reporting (Weekly CEO Briefing), and system reliability (Auto-start on boot).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - WhatsApp Message Monitoring (Priority: P1)

As a business owner, I want my Digital FTE to monitor WhatsApp for urgent messages so that I never miss time-sensitive communications from clients or team members.

**Why this priority**: WhatsApp is a primary communication channel for many businesses. Missing urgent messages can result in lost deals or delayed responses.

**Independent Test**: Can be fully tested by sending a WhatsApp message with "urgent" keyword and verifying a task file appears in Vault/Needs_Action/

**Acceptance Scenarios**:

1. **Given** WhatsApp Web is logged in and watcher is running, **When** a new message containing "urgent" arrives, **Then** a task file is created in Vault/Needs_Action/ within 60 seconds
2. **Given** WhatsApp watcher is running, **When** a message contains keywords "invoice", "payment", or "deadline", **Then** it is marked as HIGH priority in the task file
3. **Given** WhatsApp watcher is running, **When** WhatsApp Web session expires, **Then** the system logs the error and notifies the user to re-authenticate

---

### User Story 2 - Filesystem Document Monitoring (Priority: P1)

As a user, I want my Digital FTE to automatically detect new files dropped into a designated folder so that invoices, contracts, and documents are processed without manual intervention.

**Why this priority**: Document processing is a core automation need. Auto-detecting new files eliminates manual task creation.

**Independent Test**: Can be fully tested by dropping a PDF file into the watch folder and verifying a task file is created with file metadata

**Acceptance Scenarios**:

1. **Given** Filesystem watcher is monitoring ~/DigitalFTE/Dropbox/, **When** a new file is added, **Then** a task file is created in Vault/Needs_Action/ with file name, type, size, and path
2. **Given** a PDF file is dropped, **When** the watcher processes it, **Then** the task file includes suggested actions based on file type (e.g., "Review invoice", "Sign contract")
3. **Given** Filesystem watcher is running, **When** a file is modified (not new), **Then** no duplicate task is created

---

### User Story 3 - Email Sending via MCP (Priority: P2)

As a user, I want Claude to be able to send emails on my behalf so that approved responses can be executed automatically without manual copy-paste.

**Why this priority**: Completes the action layer - perception without action is incomplete. Enables true automation.

**Independent Test**: Can be fully tested by approving an email task and verifying the email is sent via Gmail

**Acceptance Scenarios**:

1. **Given** a task in Vault/Approved/ requests sending an email, **When** Claude processes it, **Then** the email is sent via the MCP server and logged
2. **Given** an email send request, **When** the recipient is not in the known contacts list, **Then** the action requires explicit human approval
3. **Given** an email is sent successfully, **When** the action completes, **Then** the task file moves to Done/ with send confirmation and message ID

---

### User Story 4 - Weekly CEO Briefing (Priority: P2)

As a business owner, I want to receive a weekly summary report every Monday morning so that I can quickly understand what my Digital FTE accomplished and what needs attention.

**Why this priority**: Provides visibility and trust in the autonomous system. Enables proactive business management.

**Independent Test**: Can be fully tested by running the briefing generator and verifying a formatted report is created in Vault/

**Acceptance Scenarios**:

1. **Given** it is Monday at 8:00 AM, **When** the briefing generator runs, **Then** a CEO_Briefing_YYYY-MM-DD.md file is created in Vault/
2. **Given** the briefing runs, **When** generating the report, **Then** it includes: tasks processed count, tasks by source (Gmail, WhatsApp, Files), pending approvals, errors/exceptions, and upcoming deadlines
3. **Given** no tasks were processed in the past week, **When** briefing generates, **Then** it clearly states "No tasks processed" rather than showing empty sections

---

### User Story 5 - Auto-Start on Laptop Boot (Priority: P3)

As a user, I want my Digital FTE system to automatically start when I open my laptop so that I don't have to manually launch each component.

**Why this priority**: Reduces friction and ensures the system is always running. Critical for "always-on" promise.

**Independent Test**: Can be fully tested by restarting the computer and verifying all watchers start automatically

**Acceptance Scenarios**:

1. **Given** auto-start is configured, **When** the laptop boots and user logs in, **Then** Gmail watcher, WhatsApp watcher, Filesystem watcher, and Orchestrator all start within 2 minutes
2. **Given** auto-start runs, **When** any component fails to start, **Then** an error notification is shown to the user
3. **Given** auto-start is running, **When** the user manually stops a component, **Then** it does not auto-restart until next boot

---

### Edge Cases

- What happens when WhatsApp Web requires QR code re-scan? → System pauses, creates alert task, waits for user action
- What happens when drop folder has 100+ files at once? → Process in batches of 10 with rate limiting
- What happens when email send fails due to rate limit? → Retry with exponential backoff, max 3 attempts
- What happens when briefing runs but log files are corrupted? → Generate partial report with error notice
- What happens when auto-start runs but credentials are expired? → Start other components, alert user about failed ones

## Requirements *(mandatory)*

### Functional Requirements

#### WhatsApp Watcher
- **FR-001**: System MUST monitor WhatsApp Web for new unread messages
- **FR-002**: System MUST detect messages containing priority keywords (urgent, invoice, payment, deadline, ASAP)
- **FR-003**: System MUST create task files with sender name, message preview, timestamp, and chat link
- **FR-004**: System MUST handle WhatsApp Web session expiration gracefully

#### Filesystem Watcher
- **FR-005**: System MUST monitor a configurable folder path for new files
- **FR-006**: System MUST support common file types: PDF, DOCX, XLSX, PNG, JPG
- **FR-007**: System MUST extract file metadata: name, size, type, creation date
- **FR-008**: System MUST ignore temporary files (starting with ~ or .tmp)

#### Email Sender MCP
- **FR-009**: System MUST expose an MCP tool for Claude to send emails
- **FR-010**: System MUST support: recipient, subject, body, and optional attachments
- **FR-011**: System MUST log all sent emails with timestamp and message ID
- **FR-012**: System MUST enforce rate limits (max 10 emails per hour)

#### Weekly CEO Briefing
- **FR-013**: System MUST generate briefing report on configurable schedule (default Monday 8 AM)
- **FR-014**: System MUST aggregate data from all log files in the past 7 days
- **FR-015**: System MUST include: task counts, source breakdown, error summary, pending items
- **FR-016**: System MUST format report as readable markdown

#### Auto-Start
- **FR-017**: System MUST register all components to start on user login
- **FR-018**: System MUST support Windows Task Scheduler for auto-start
- **FR-019**: System MUST verify each component started successfully
- **FR-020**: System MUST create startup log entry

### Key Entities

- **WhatsAppMessage**: Sender name, phone number, message text, timestamp, chat ID, priority level
- **WatchedFile**: File path, file name, file type, size, creation date, suggested actions
- **SentEmail**: Recipient, subject, body, attachments, timestamp, message ID, status
- **CEOBriefing**: Report date, period covered, task statistics, error summary, recommendations
- **StartupEvent**: Component name, start time, status (success/failure), error message if any

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: WhatsApp messages are detected and task files created within 60 seconds of receipt
- **SC-002**: Files dropped in watch folder generate tasks within 30 seconds
- **SC-003**: Approved emails are sent within 10 seconds of Claude processing
- **SC-004**: CEO Briefing is generated and available by 8:15 AM every Monday
- **SC-005**: All watchers start within 2 minutes of user login
- **SC-006**: System achieves 99% uptime during business hours (8 AM - 6 PM)
- **SC-007**: Zero emails sent without proper approval (100% HITL compliance)
- **SC-008**: All actions logged with complete audit trail (no missing entries)

## Assumptions

- User has WhatsApp Web access and can scan QR code for initial setup
- Gmail API credentials are already configured from Bronze tier
- User's laptop runs Windows 10/11 with Task Scheduler available
- User will maintain active internet connection during operation
- File watch folder has reasonable file volume (<100 new files/day)

## Out of Scope

- WhatsApp message replies (perception only, no action in this tier)
- OCR or content extraction from dropped files
- Real-time notifications (push notifications to mobile)
- Multi-user support (single user system)
- Cloud deployment (local only in Silver tier)

## Dependencies

- Bronze tier implementation (Gmail watcher, Orchestrator, Vault structure)
- Playwright library for WhatsApp Web automation
- Gmail API with send scope for Email MCP
- Python watchdog library for filesystem monitoring
