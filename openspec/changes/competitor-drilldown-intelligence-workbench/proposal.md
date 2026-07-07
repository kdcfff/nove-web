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
