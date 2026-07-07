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

## Open Questions

- Should analysis notes be shown in reports and task records in this change, or only stored for future analysis prompt integration?
- Should manual target creation immediately trigger collection, or should it remain a separate explicit `保存已选` then `一键采集` flow? Current recommendation: keep explicit collection.
