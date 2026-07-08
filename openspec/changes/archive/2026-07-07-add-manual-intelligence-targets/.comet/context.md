# Comet Design Handoff

- Change: add-manual-intelligence-targets
- Phase: design
- Mode: compact
- Context hash: f9825e0660a797e3753adf59334b1900222f015ca59a86aa9345f4dc4bb86899

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/add-manual-intelligence-targets/proposal.md

- Source: openspec/changes/add-manual-intelligence-targets/proposal.md
- Lines: 1-35
- SHA256: 1e35c0eb60e597f873f90cb030ac071e9b0ff47cb5eb4bdb738c1bb3d9656cb5

```md
## Why

Competitive intelligence setup currently depends on recommended monitoring pages. When automatic discovery misses a pricing page, customer story, docs page, RSS feed, or other user-known target, the user cannot explicitly add that target into the verified monitoring and analysis pipeline from the competitor detail workflow.

This change lets users define their own competitor monitoring targets while preserving the core product rule: a target must be validated before it becomes an active monitored target and feeds collection, baseline, diff, reports, and custom competitor analysis.

## What Changes

- Add a manual target entry path in the competitor detail workflow.
- Let users enter target type, title, URL, and optional analysis notes for a competitor-specific monitoring target.
- Mark manually entered targets as manual-source candidates before activation.
- Reuse the existing backend target creation validation so failed targets do not become active monitored targets.
- Feed validated manual targets into the existing collection, first baseline, field-level diff, report, task history, and one-click collection flows.
- Show validation failures in the same candidate-target area instead of silently adding invalid targets.
- No breaking changes.

## Capabilities

### New Capabilities
- `manual-intelligence-targets`: Users can add competitor-specific monitoring targets manually, validate them, and activate them into the competitive intelligence pipeline.

### Modified Capabilities
- None.

## Impact

- Frontend competitive intelligence workbench:
  - `/Users/kongdecheng/workspace/nova/nova-web/src/pages/intelligence/index.vue`
  - `/Users/kongdecheng/workspace/nova/nova-web/src/api/intelligence/types.ts`
  - `/Users/kongdecheng/workspace/nova/nova-web/src/api/intelligence/index.ts`
- Backend competitive intelligence API and contract may need minor DTO or persistence support if analysis notes or target source must be stored:
  - `/Users/kongdecheng/workspace/nova/nova-backend/nova-modules/nova-intelligence/src/main/java/org/ruoyi/intelligence/controller/IntelligenceController.java`
  - `/Users/kongdecheng/workspace/nova/nova-backend/nova-modules/nova-intelligence/src/main/java/org/ruoyi/intelligence/service/IntelligenceService.java`
  - `/Users/kongdecheng/workspace/nova/nova-backend/nova-modules/nova-intelligence/src/main/java/org/ruoyi/intelligence/domain/IntelligenceDtos.java`
- Existing target validation, collection, snapshot, diff, report, and task-run behavior must continue to work for recommended and manual targets.

```

## openspec/changes/add-manual-intelligence-targets/design.md

- Source: openspec/changes/add-manual-intelligence-targets/design.md
- Lines: 1-84
- SHA256: 7b5a1ba3a76233d32d49b1e5c951534b9e89a4d365d1eef8ad816626afff146f

[TRUNCATED]

```md
## Context

The competitive intelligence workbench is now competitor-list driven. Users open a competitor detail drawer to review basic information, pending monitoring pages, active monitored targets, reports, tasks, and first-baseline status.

Current target setup has two paths:

- The frontend calls `recommendMonitorTargets` to create draft candidates from the competitor homepage.
- The frontend calls `createMonitorTarget` to save selected drafts. The backend validates reachability before inserting an active target.

This works when discovery finds the right URLs, but product and marketing users often know pages the system cannot infer: a special pricing page, docs area, launch page, case study, RSS feed, or competitor-owned content URL. The workbench needs a manual entry path that still respects the existing rule: failed validation cannot become active monitoring.

## Goals / Non-Goals

**Goals:**

- Let users manually add competitor-specific monitoring targets from the competitor detail drawer.
- Capture enough metadata to support later analysis: target type, title, URL, manual source, and optional analysis notes.
- Reuse existing backend validation before a manual target becomes active.
- Feed validated manual targets into the same collection, baseline, diff, report, and task history flows as recommended targets.
- Make validation success and failure visible in the pending target area.

**Non-Goals:**

- Do not create a separate custom-analysis pipeline.
- Do not allow validation-failed targets to be force-saved in MVP.
- Do not add MCP as a required path.
- Do not redesign the whole intelligence workbench layout.
- Do not implement social, traffic, or AI-mention target adapters in this change.

## Decisions

### Decision 1: Manual entry lives in the competitor detail drawer

Users already drill into a competitor to manage targets and collection. The manual entry action belongs next to `发现监控页` in the `待确认监控页` section.

Alternative considered: add manual entry to the global toolbar. That makes competitor ownership ambiguous and increases the risk of adding a target to the wrong competitor.

### Decision 2: Manual targets start as frontend candidates, then activate through backend validation

The manual form creates a pending candidate with `source = manual`, `validationStatus = pending`, and user-provided fields. When the user saves it, the existing target creation endpoint performs live validation. A success response creates an active target; a failure remains visible as a failed pending candidate.

Alternative considered: call a separate validation endpoint before saving. That gives finer control, but the backend already validates on create and MVP can keep one authoritative validation boundary.

### Decision 3: Persist manual source and analysis notes if backend storage supports the change

The target request and view should support:

- `source`: `homepage_link`, `feed_hint`, `rule_fallback`, or `manual`
- `analysisNotes`: optional free text describing what the user wants Nova to watch on this target

These fields are metadata for user trust and future analysis prompts. Collection and diff still operate on URL content and target type.

Alternative considered: keep these fields frontend-only. That loses provenance after refresh and makes manual targets indistinguishable in reports and tasks.

### Decision 4: Keep capture and report generation unchanged

Once a manual target is active, one-click collection, target collection, first baseline, snapshot diff, task records, and reports use the same target IDs and existing pipeline.

Alternative considered: implement a custom analysis mode immediately. That would expand scope into prompt design, report schema, and scheduling semantics without changing the core setup bottleneck.

## Risks / Trade-offs

- [Risk] Some valid pages block simple validation requests.
  - Mitigation: preserve the current validation error message and let users edit the URL. Browser-rendered capture fallback remains part of collection, not target validation.
- [Risk] Free-form analysis notes could be mistaken for evidence.
  - Mitigation: treat notes as user intent/context only; reports must still be based on captured evidence and structured diffs.
- [Risk] Adding target metadata may require a backend schema migration.
  - Mitigation: keep fields nullable with defaults and preserve existing request compatibility.
- [Risk] The OpenSpec change is tracked under `nova-web` while implementation touches `nova-backend`.
  - Mitigation: tasks explicitly list backend contract work; backend commits must be reviewed together with frontend behavior.

## Migration Plan

1. Add nullable target metadata fields on the backend if absent.
2. Extend DTOs and API types without breaking existing callers.
3. Add the frontend manual target form and candidate behavior.
4. Verify recommended targets, manual targets, validation failures, active targets, one-click collection, and task records.

Rollback strategy: remove the manual entry UI. Backend nullable metadata fields can remain harmless if already migrated.


```

Full source: openspec/changes/add-manual-intelligence-targets/design.md

## openspec/changes/add-manual-intelligence-targets/tasks.md

- Source: openspec/changes/add-manual-intelligence-targets/tasks.md
- Lines: 1-35
- SHA256: 867628d733646bc9e95494d0f24cbc4681a56048258702b4fd207f98a95cc134

```md
## 1. Contract And Data Model

- [ ] 1.1 Inspect existing target entity, DTO, mapper, SQL migration, and frontend API types for target source and analysis notes support.
- [ ] 1.2 Add nullable backend target metadata fields for `source` and `analysisNotes` if they are not already persisted.
- [ ] 1.3 Extend backend target request and view DTOs while keeping existing callers compatible.
- [ ] 1.4 Extend frontend `MonitorTargetVo` and `MonitorTargetRequest` types for manual target metadata.

## 2. Manual Target Entry UX

- [ ] 2.1 Add a competitor-scoped manual target entry action in the detail drawer pending-target section.
- [ ] 2.2 Implement the manual target form using Element Plus controls for type, title, URL, and optional analysis notes.
- [ ] 2.3 Convert submitted manual target forms into pending candidates with `source = manual`.
- [ ] 2.4 Keep pending manual targets editable before activation and visually distinct from discovered targets.

## 3. Validation And Activation

- [ ] 3.1 Reuse backend target creation validation for manual targets.
- [ ] 3.2 Ensure validation-success manual targets become active monitored targets for the selected competitor.
- [ ] 3.3 Ensure validation-failed manual targets do not enter active monitoring and show the failure reason.
- [ ] 3.4 Preserve RSS-specific validation behavior for manual RSS targets.

## 4. Pipeline Integration

- [ ] 4.1 Ensure active manual targets appear in the competitor's monitored targets list after refresh.
- [ ] 4.2 Ensure active manual targets participate in target-level collection.
- [ ] 4.3 Ensure active manual targets participate in competitor one-click collection.
- [ ] 4.4 Ensure first baseline, task records, diff, and reports continue to use the existing pipeline for manual targets.

## 5. Verification

- [ ] 5.1 Run backend tests or focused compile checks for intelligence DTO/service changes.
- [ ] 5.2 Run frontend typecheck/build for intelligence page changes.
- [ ] 5.3 Smoke test a valid manual webpage target from the documented target-site list through UI activation.
- [ ] 5.4 Smoke test a validation failure and confirm no active target is created.
- [ ] 5.5 Verify existing recommendation-based target flow still works.

```

## openspec/changes/add-manual-intelligence-targets/specs/manual-intelligence-targets/spec.md

- Source: openspec/changes/add-manual-intelligence-targets/specs/manual-intelligence-targets/spec.md
- Lines: 1-80
- SHA256: 27dfd0875d2d99e4ed95c5899f6320eb5ccdc60e3e8190ad07ebbe6bd97576e8

```md
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

```
