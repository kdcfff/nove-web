## ADDED Requirements

### Requirement: Competitor list is the primary entry
The intelligence workbench SHALL make the competitor list the primary entry point for operating competitive intelligence.

#### Scenario: User opens the intelligence workbench
- **WHEN** the user opens the intelligence workbench
- **THEN** the system MUST show competitors as the primary navigable objects before target, task, or report operations

#### Scenario: User has no competitors
- **WHEN** the workbench has no competitors
- **THEN** the system MUST show a clear add-competitor action as the first step

### Requirement: Competitor detail scopes operational data
The intelligence workbench SHALL provide a competitor detail workspace that scopes monitoring targets, target recommendations, collection state, tasks, and reports to the selected competitor.

#### Scenario: User selects a competitor
- **WHEN** the user selects a competitor from the competitor list
- **THEN** the system MUST display a detail workspace for that competitor
- **THEN** the system MUST scope target recommendations, active targets, task runs, and reports to that competitor

#### Scenario: User switches competitor
- **WHEN** the user switches from one competitor to another
- **THEN** the system MUST refresh or derive detail state for the newly selected competitor
- **THEN** the system MUST NOT show target, task, or report rows from the previously selected competitor as if they belonged to the new competitor

### Requirement: Target recommendation language is user-facing
The intelligence workbench SHALL describe recommended URLs as pages awaiting confirmation rather than exposing internal candidate terminology.

#### Scenario: Recommended targets are displayed
- **WHEN** the system displays recommended URLs before activation
- **THEN** the UI MUST label them as `待确认监控页` or `待加入监控页`
- **THEN** the UI MUST show enough target provenance or validation state for the user to understand whether the page can become an active monitor target

### Requirement: First monitoring happens inside competitor detail
The intelligence workbench SHALL allow the user to start monitoring from the selected competitor detail by saving selected validated pages and collecting all saved active targets for that competitor.

#### Scenario: User starts monitoring a competitor
- **WHEN** the selected competitor has recommended validated pages and the user starts monitoring
- **THEN** the system MUST save the selected validated pages as active monitor targets for that competitor
- **THEN** the system MUST trigger first collection for all selected saved active targets
- **THEN** the system MUST show per-target first collection progress in that competitor detail

#### Scenario: Recommended page fails validation
- **WHEN** a recommended page fails validation
- **THEN** the system MUST NOT add it as an active monitor target
- **THEN** the competitor detail MUST make the failed validation recoverable by allowing the user to remove, edit, or retry the page

### Requirement: Competitor detail explains baseline and report state
The intelligence workbench SHALL distinguish first collection baselines from generated intelligence reports within the selected competitor context.

#### Scenario: First collection creates a baseline
- **WHEN** first collection completes without a prior snapshot for the selected competitor target
- **THEN** the system MUST describe the output as `首次基线`
- **THEN** the system MUST explain that a report requires later meaningful diff evidence

#### Scenario: Reports exist for selected competitor
- **WHEN** reports exist for the selected competitor
- **THEN** the system MUST show the selected competitor detail state as having discovered changes
- **THEN** the report entry MUST allow the user to inspect evidence before acting

### Requirement: Global views are secondary
The intelligence workbench MAY include cross-competitor report or task views, but competitor detail SHALL remain the primary place for normal target, collection, and report operations.

#### Scenario: User opens an all-report view
- **WHEN** the user opens a cross-competitor report view
- **THEN** the system MUST identify which competitor each report belongs to
- **THEN** the system MUST provide a path back into the related competitor detail
