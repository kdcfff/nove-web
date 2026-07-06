## ADDED Requirements

### Requirement: Dedicated intelligence workbench route
The frontend SHALL provide a dedicated `/intelligence` route with a visible sidebar entry labeled `竞品情报`.

#### Scenario: User opens intelligence route
- **WHEN** a user navigates to `/intelligence`
- **THEN** the workbench renders inside the existing application layout

#### Scenario: User clicks sidebar entry
- **WHEN** a user clicks the `竞品情报` sidebar entry
- **THEN** the app navigates to the intelligence inbox

### Requirement: Inbox-first workbench
The workbench SHALL default to an intelligence inbox showing recent and high-priority reports.

#### Scenario: Reports exist
- **WHEN** the inbox API returns reports
- **THEN** the frontend displays report summaries with competitor, priority, confidence, unread state, evidence count, and recommended action summary

#### Scenario: No reports exist
- **WHEN** the inbox API returns no reports
- **THEN** the frontend displays onboarding actions to add a competitor, add or generate targets, and trigger first collection

### Requirement: Competitor and target management
The workbench SHALL allow users to manage competitors and monitor targets.

#### Scenario: User creates competitor
- **WHEN** a user submits a valid competitor name and homepage
- **THEN** the frontend sends a create request and shows the competitor in the workbench

#### Scenario: User confirms target recommendations
- **WHEN** target recommendation drafts are returned for a competitor homepage
- **THEN** the frontend lets the user select, edit, and confirm drafts before saving monitor targets

#### Scenario: User triggers collection
- **WHEN** a user triggers collection for a monitor target
- **THEN** the frontend shows an asynchronous task status instead of blocking on capture completion

### Requirement: Report detail with evidence and feedback
The workbench SHALL provide a report detail view with evidence, old/new snippets, AI reasoning, recommended actions, read state, feedback, and knowledge writeback.

#### Scenario: User opens report detail
- **WHEN** a user opens an intelligence report
- **THEN** the frontend displays change summary, strategic intent, business impact, recommended actions, priority, confidence, evidence, reason, and old/new snippets

#### Scenario: User submits feedback
- **WHEN** a user selects useful, not useful, false positive, or handled
- **THEN** the frontend sends feedback and reflects the saved feedback state

#### Scenario: User writes report to knowledge
- **WHEN** a user clicks knowledge writeback for a report
- **THEN** the frontend calls the backend writeback API and displays writeback status

### Requirement: Optional company profile settings
The workbench SHALL provide optional company/product profile settings used to improve AI analysis.

#### Scenario: Profile is missing
- **WHEN** the workbench detects no company profile
- **THEN** it prompts the user to add one while still allowing competitive intelligence workflows

#### Scenario: Profile is saved
- **WHEN** a user saves product name, homepage, target customers, core capabilities, and positioning
- **THEN** the frontend persists the profile through the backend API

### Requirement: Natural-language chat entry
The chat experience SHALL support natural-language competitive intelligence questions using backend APIs and SHALL limit write operations to drafts requiring workbench confirmation.

#### Scenario: User asks for competitor movement
- **WHEN** a user asks a competitive intelligence question in chat
- **THEN** the frontend/backend chat flow retrieves relevant reports and evidence and returns an analysis with links to workbench reports

#### Scenario: Chat proposes monitor targets
- **WHEN** chat proposes new competitors or monitor targets
- **THEN** the frontend presents them as drafts that require confirmation in the workbench before saving

### Requirement: Station-internal unread indicator
The frontend SHALL show a station-internal unread indicator for new intelligence reports.

#### Scenario: Unread reports exist
- **WHEN** the inbox reports unread items
- **THEN** the sidebar or workbench navigation displays an unread indicator or count

#### Scenario: User reads report
- **WHEN** a user opens or marks a report as read
- **THEN** the unread indicator updates after the read state is saved
