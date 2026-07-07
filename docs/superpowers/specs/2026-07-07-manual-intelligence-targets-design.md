---
comet_change: add-manual-intelligence-targets
role: technical-design
canonical_spec: openspec
---

# Manual Intelligence Targets Design

## Context

The competitive intelligence workbench is competitor-list driven. A user opens a competitor detail drawer to inspect pending monitoring pages, active targets, reports, task history, and first-baseline state.

Target setup currently depends on recommended drafts. The frontend calls `recommendMonitorTargets`, converts returned targets to draft candidates, and later calls `createMonitorTarget` for selected drafts. The backend `createTarget` path already validates webpage and RSS reachability before inserting an active `intel_monitor_target`.

The missing capability is user-defined targets. Product and marketing users often know pages that discovery cannot infer: a special pricing URL, docs section, customer story, launch page, RSS feed, or other official competitor page. They need a way to add those URLs without bypassing validation or creating a separate analysis pipeline.

## Confirmed Approach

Use the existing pending-target workflow and extend active target metadata.

1. The competitor detail drawer adds a `手动添加目标` action in the `待确认监控页` section.
2. The manual form collects target type, title, URL, and optional analysis notes.
3. Submitting the form creates a frontend pending candidate with `source = manual`.
4. Saving selected candidates calls the existing backend target creation API.
5. Backend validation remains the activation gate. Failed targets do not become active.
6. Successful manual targets become normal active monitor targets and participate in existing collection, baseline, diff, report, task, delete, and one-click collection flows.

## Data Contract

Extend monitor target request and view objects with nullable metadata:

```text
source: homepage_link | html_link | feed_hint | rule_fallback | manual
analysisNotes: string | null
```

Backend persistence should add nullable fields to `intel_monitor_target`:

```text
source varchar(32) null default 'manual'
analysis_notes varchar(1024) null
```

Existing targets remain valid. Existing callers that do not send these fields continue to work; service code supplies conservative defaults.

`analysisNotes` is user intent context. It is not evidence. Report evidence must continue to come from captured content, structured snapshots, and field-level changes.

## Frontend Design

The UI stays inside the existing competitor detail drawer.

- Add a secondary button next to `发现监控页`: `手动添加目标`.
- Open a compact Element Plus dialog or inline drawer-local form.
- Fields:
  - `类型`: select using existing target type labels.
  - `标题`: text input.
  - `URL`: URL input.
  - `分析关注点`: textarea, optional.
- On submit, validate only local required fields and URL shape, then append a pending draft:
  - `selected = true`
  - `source = manual`
  - `validationStatus = pending`
  - `validationMessage = 保存时验活；通过后才会进入 active 监控`

The draft row remains editable before activation. The source tag shows `手动添加`. Failed validation leaves a visible failed state and reason instead of silently creating an active target.

## Backend Design

The backend keeps one authoritative activation path: `createTarget`.

- Normalize URL with existing logic.
- Validate reachability with existing webpage/RSS rules.
- Persist active target only after validation passes.
- Store `source`, defaulting to `manual` when request metadata is absent in the manual entry path or `rule_fallback` for legacy recommendation saves if no better source is supplied.
- Store nullable `analysisNotes`.
- Return metadata in `MonitorTargetVo` so refresh preserves provenance.

No new validation endpoint is required for this change. A separate candidate persistence table is deferred to the broader target discovery flow.

## Pipeline Integration

Manual targets are not a new source type at runtime. After activation, they are `IntelMonitorTarget` rows like recommended targets.

```text
Manual form
  -> pending draft candidate
  -> createTarget validation
  -> active intel_monitor_target
  -> triggerCollect / one-click collection
  -> raw capture
  -> structured snapshot
  -> field-level diff
  -> report generation
  -> task history and inbox
```

This keeps the product promise intact: custom user input changes what Nova monitors, not the evidence standard Nova uses to generate intelligence.

## Error Handling

- Missing required fields: block in the frontend and keep form values.
- Invalid URL shape: block in the frontend where possible; backend remains authoritative.
- Webpage validation failure: do not insert target; show backend error in the pending draft row.
- RSS non-feed response: do not insert target; show the RSS-specific failure reason.
- Competitor mismatch: detail drawer actions must only operate on the selected competitor ID.
- Refresh after success: active target still shows manual source and analysis notes if the UI displays metadata.

## Alternatives Considered

### Frontend-only manual candidates

This is quickest but loses source and notes after activation. It fails the custom-analysis direction because the backend cannot tell a user-defined target from an inferred target later.

### Dedicated target candidate table

This is the strongest long-term discovery model because it can persist candidate status, validation diagnostics, and failure history. It overlaps with the existing `improve-intelligence-target-discovery-flow` change, so this change defers it.

## Testing Strategy

Backend:

- Create a manual webpage target with valid URL and assert active target includes `source = manual`.
- Create a manual target with invalid URL and assert no active target is inserted.
- Create a manual RSS target against non-feed content and assert validation fails.
- Confirm existing request bodies without metadata still create targets.

Frontend:

- Build/typecheck the intelligence page.
- Open a competitor drawer, add a manual target, confirm it appears as a pending manual draft.
- Save a valid manual target and verify it appears under monitored targets after refresh.
- Save an invalid manual target and verify the failure reason is visible and no active row appears.
- Run one-click collection for a competitor with a manual target and verify a task record is created for that target.

Smoke:

- Use one documented target site as a valid manual webpage target.
- Use an invalid URL or non-feed RSS target to confirm validation failure behavior.

## Scope Boundaries

This change does not add full candidate persistence, social/traffic/AI mention adapters, or a new LLM analysis prompt pipeline. Those remain future changes. The deliverable is a reliable user-defined target entry path that feeds the existing competitive intelligence pipeline.
