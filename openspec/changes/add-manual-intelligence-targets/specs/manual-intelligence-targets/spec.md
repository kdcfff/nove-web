## ADDED Requirements

### Requirement: Manual competitor monitoring target entry
The system SHALL let users create a manual monitoring target for a specific competitor from that competitor's detail workflow.

#### Scenario: User opens manual target entry
- **WHEN** the user is viewing a competitor detail drawer
- **THEN** the system shows an action to manually add a monitoring target for that competitor

#### Scenario: User enters manual target fields
- **WHEN** the user adds a manual target
- **THEN** the system requires target type, title, and URL
- **THEN** the system allows optional analysis notes for what the user wants to monitor on that target

#### Scenario: Manual target is scoped to selected competitor
- **WHEN** the user submits a manual target from a competitor detail drawer
- **THEN** the system associates the target candidate with that competitor only

### Requirement: Manual target candidate provenance
The system SHALL identify manually entered targets as manual-source candidates before and after activation.

#### Scenario: Manual target appears in pending targets
- **WHEN** the user submits a valid manual target form
- **THEN** the system shows the target in the pending monitoring pages area
- **THEN** the target source is displayed as manual

#### Scenario: Manual source is retained after refresh
- **WHEN** a manually entered target has been validated and activated
- **THEN** the system preserves the target source as manual after the workbench or competitor detail drawer is refreshed

#### Scenario: Manual target remains editable before activation
- **WHEN** a manual target is still pending
- **THEN** the user can edit its URL before saving it as an active monitored target

### Requirement: Manual target analysis notes
The system SHALL allow users to attach optional analysis notes to a manual target as user intent context.

#### Scenario: User provides analysis notes
- **WHEN** the user submits a manual target with analysis notes
- **THEN** the system stores the notes with the target as user-provided monitoring context

#### Scenario: Analysis notes are not evidence
- **WHEN** the system generates intelligence from a manual target
- **THEN** the system MUST NOT treat analysis notes as captured evidence
- **THEN** report evidence MUST still come from captured content, structured snapshots, and field-level changes

### Requirement: Manual target validation before activation
The system MUST validate a manual target before it becomes an active monitored target.

#### Scenario: Manual target validation succeeds
- **WHEN** the user saves a selected manual target and the backend validates the URL as reachable for its target type
- **THEN** the system creates an active monitored target
- **THEN** the active target appears under the same competitor's monitored targets

#### Scenario: Manual target validation fails
- **WHEN** the user saves a selected manual target and the backend rejects the URL
- **THEN** the system MUST NOT create an active monitored target
- **THEN** the system shows the validation failure reason in the pending target workflow

#### Scenario: RSS target validation fails for non-feed content
- **WHEN** the user saves a manual target with type `rss` and the URL does not return recognizable feed content
- **THEN** the system MUST NOT create an active monitored target
- **THEN** the system shows that the RSS target did not return recognizable feed content

### Requirement: Manual targets use existing intelligence pipeline
The system SHALL use the existing competitive intelligence pipeline for validated manual targets.

#### Scenario: Manual target is collected
- **WHEN** a manual target has become an active monitored target
- **THEN** the user can trigger collection for that target through the same target collection controls as recommended targets

#### Scenario: Manual target participates in one-click competitor collection
- **WHEN** the user clicks one-click collection for a competitor that has active manual targets
- **THEN** the system collects those manual targets along with the competitor's other active targets

#### Scenario: Manual target creates baseline and reports
- **WHEN** an active manual target is collected for the first time
- **THEN** the system establishes a first baseline using the existing snapshot pipeline
- **WHEN** later collection detects field-level effective changes
- **THEN** the system generates intelligence reports using the existing diff and report pipeline
