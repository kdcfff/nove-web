# Comet Design Handoff

- Change: competitor-drilldown-intelligence-workbench
- Phase: design
- Mode: compact
- Context hash: db6dd72323c98dd930383d4270bda6a27d7f6fb06c7ec2467b9e00cdc0f39101

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/competitor-drilldown-intelligence-workbench/proposal.md

- Source: openspec/changes/competitor-drilldown-intelligence-workbench/proposal.md
- Lines: 1-53
- SHA256: 152dd46e8642683a651a08076e7d3ff1a853264f5a519b51f0aa05aa5f94cf06

```md
## Why

The current competitive intelligence UI still asks users to understand global tabs before they can operate a specific competitor. That weakens the core product mental model: users think in competitors first, then monitoring pages, captures, diffs, reports, and actions under that competitor.

This change makes the competitor list the primary entry point and turns each competitor into the drilldown workspace for target management, first collection, baselines, task runs, diff reports, and follow-up actions.

## What Changes

- Rework the competitive intelligence workbench from a global tabs-first surface into a competitor-list-driven drilldown experience.
- Make `竞品列表` the primary first-level object: users select a competitor before managing targets, collection, reports, and tasks.
- Add a competitor detail workspace that contains:
  - overview and next-step state for that competitor
  - target recommendation / confirmation
  - active monitoring targets
  - first collection baseline status
  - task run history
  - diff/report list and evidence-first report detail entry
  - action and feedback entry points
- Rename or reposition ambiguous candidate-target language toward user-facing terms such as `待确认监控页` / `待加入监控页`.
- Preserve the existing backend capture chain: validated targets only, first collection creates baseline, later collection creates diffs/reports when meaningful changes exist.
- Add only minimal backend/API filtering interfaces if the frontend cannot reliably scope reports or tasks by competitor from existing data.
- Keep global report/task views as secondary cross-competitor views, not the main way to operate the feature.

## Capabilities

### New Capabilities

- `competitor-drilldown-intelligence-workbench`: Frontend capability for operating competitive intelligence through a competitor list and competitor detail workspace, including scoped targets, collection state, baselines, tasks, reports, and actions.

### Modified Capabilities

- None.

## Impact

- Frontend product shape:
  - `src/pages/intelligence/index.vue`
  - related intelligence API types and helpers under `src/api/intelligence/**`
- Possible minimal backend/API impact:
  - optional query parameters or response fields for scoping reports/tasks by competitor
  - no persistence, scheduler, AI analyzer, or capture architecture change in this change
- Documentation and verification:
  - OpenSpec artifacts for the competitor-drilldown product shape
  - browser smoke path for competitor list -> competitor detail -> target confirmation -> first collection -> baseline/report visibility

## Out Of Scope

- Database persistence changes.
- SnailJob scheduler implementation.
- AI analyzer changes.
- New external notification channels.
- Full automated competitor discovery.
- Rebuilding the backend capture/diff pipeline.
```

## openspec/changes/competitor-drilldown-intelligence-workbench/design.md

- Source: openspec/changes/competitor-drilldown-intelligence-workbench/design.md
- Lines: 1-151
- SHA256: ca39c375bbf953901c41375e05ee39fac1c63a8ca388a296dc2a0e48da02b8f7

[TRUNCATED]

```md
## Context

The intelligence page currently contains useful pieces, but the navigation model is still global: overview, reports, competitors/targets, and tasks are peer tabs. That makes the user infer which competitor each action belongs to and weakens the end-to-end path from "I care about this competitor" to "show me what changed and what to do."

The backend chain is already enough for the MVP:

```text
Competitor
  -> recommended monitor targets
  -> validated active targets
  -> first collection baseline
  -> later snapshot diff
  -> report and evidence
```

This change keeps that chain and changes the frontend product form around it. The competitor becomes the primary navigation object.

## Goals / Non-Goals

**Goals:**

- Make the first usable screen a `竞品列表` with clear monitoring status per competitor.
- Let users click a competitor and operate a scoped detail workspace.
- Keep target discovery, active target management, first collection, task history, reports, evidence detail, feedback, and knowledge writeback inside the selected competitor context.
- Preserve the validated-target rule: failed targets are not active monitor targets and must not be silently inserted.
- Make first collection understandable as `首次基线`, not as an empty report inbox.
- Keep cross-competitor report/task views secondary and clearly labeled as global views.
- Add minimal API query parameters or client-side joins only where needed to filter reports/tasks by competitor.

**Non-Goals:**

- Do not redesign the capture, diff, or AI analysis pipeline.
- Do not add database persistence or scheduler implementation.
- Do not make MCP or chat the primary UI for this flow.
- Do not add forced monitoring for failed/unvalidated targets.
- Do not build a dashboard-heavy analytics product in this change.

## Decisions

### Decision 1: Competitor Is The Primary Route/Object

The workbench should be organized as:

```text
竞品列表
  -> 竞品详情
       -> 概览
       -> 待确认监控页
       -> 已监控目标
       -> 首次基线 / 采集任务
       -> 情报报告
       -> 行动 / 反馈 / 知识写入
```

Rationale: target setup, collection, diff evidence, and recommended action all become easier to understand when scoped to one competitor. This also matches how users think: "Cursor changed pricing" or "Lovable shipped docs updates", not "a target row changed somewhere."

Alternative considered: keep the existing global tabs and improve filters. Rejected because it still makes users stitch together competitors, targets, and reports manually.

### Decision 2: Use A List And Detail Product Shape

The main surface should be a split or drilldown layout depending on screen size:

- Desktop: competitor list/table on the left or as the first pane, selected competitor detail on the right.
- Mobile/narrow: list first, then route or state-driven detail screen with a back affordance.

The selected competitor state should drive all scoped data:

- `selectedCompetitor`
- `selectedTargets`
- `selectedDraftTargets`
- `selectedTasks`
- `selectedReports`
- `selectedOverviewState`

Rationale: this avoids global computed state accidentally mixing multiple competitors.

### Decision 3: Keep Existing Backend Chain, Add Scoped Read Helpers Only If Needed

Current APIs already support `listMonitorTargets(competitorId)`. Reports and tasks can initially be scoped by joining frontend data:

```

Full source: openspec/changes/competitor-drilldown-intelligence-workbench/design.md

## openspec/changes/competitor-drilldown-intelligence-workbench/tasks.md

- Source: openspec/changes/competitor-drilldown-intelligence-workbench/tasks.md
- Lines: 1-29
- SHA256: 612c1682cda89d54cf416420a6c53be7625f5412f431498c44c49a5f257f30fa

```md
## 1. Product Shape And State

- [ ] 1.1 Replace the global tabs-first default with a competitor-list-first workbench entry.
- [ ] 1.2 Add selected-competitor state and derive detail data from the selected competitor.
- [ ] 1.3 Ensure switching competitors clears or refreshes stale target, task, report, and draft state.
- [ ] 1.4 Keep global report/task access secondary and label it as cross-competitor.

## 2. Competitor Detail Workspace

- [ ] 2.1 Build the selected competitor detail layout with overview, targets, collection, reports, and tasks sections.
- [ ] 2.2 Move target recommendation into the selected competitor detail.
- [ ] 2.3 Rename candidate target UI copy to `待确认监控页` or `待加入监控页`.
- [ ] 2.4 Keep failed validation pages out of active targets and make removal, edit, or retry visible.
- [ ] 2.5 Run first monitoring from competitor detail by saving selected validated pages and collecting all saved active targets.
- [ ] 2.6 Show per-target first collection progress and `首次基线` status under the selected competitor.

## 3. Reports, Tasks, And API Scope

- [ ] 3.1 Scope report lists and report detail entry to the selected competitor.
- [ ] 3.2 Scope task run lists to the selected competitor by target relation or backend query parameter.
- [ ] 3.3 Add minimal report/task `competitorId` query support only if frontend scoping is unreliable.
- [ ] 3.4 Preserve evidence-first report detail, feedback, and knowledge writeback actions in the competitor context.

## 4. Verification

- [ ] 4.1 Run frontend type/build verification.
- [ ] 4.2 Browser verify add competitor -> select competitor detail -> discover pages -> start monitoring -> baseline state.
- [ ] 4.3 Browser verify switching competitors does not leak targets, tasks, or reports from the previous competitor.
- [ ] 4.4 Browser verify a documented sample site from `/Users/kongdecheng/workspace/nova/doc/competitive-intelligence-target-sites.yaml` still reaches the first-collection path.
```

## openspec/changes/competitor-drilldown-intelligence-workbench/specs/competitor-drilldown-intelligence-workbench/spec.md

- Source: openspec/changes/competitor-drilldown-intelligence-workbench/specs/competitor-drilldown-intelligence-workbench/spec.md
- Lines: 1-68
- SHA256: 4cfb772bf385255527475e88085b4deee96b2fedab0272c503ff8de9ee4900a6

```md
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
```

