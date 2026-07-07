---
comet_change: competitor-drilldown-intelligence-workbench
role: technical-design
canonical_spec: openspec
---

# Competitor Drilldown Intelligence Workbench Design

## Summary

Rework the competitive intelligence workbench so the user starts from a competitor list and drills into one competitor before managing pages, captures, baselines, tasks, and reports. The first implementation stays on `/intelligence` as a split-view experience, but state and component boundaries are shaped so a later `/intelligence/competitors/:id` route can be introduced without redesigning the feature.

This design preserves the current backend capture chain. The only backend work in scope is minimal competitor-scoped read filtering for reports and tasks.

## Current State

The current page is a single component with global tabs:

- `监控概览`
- `情报报告`
- `竞品与目标`
- `任务记录`

The code already has the core operations: create competitor, recommend targets, create active monitor targets with backend validation, trigger collection, list reports, list tasks, open report detail, submit feedback, write report to knowledge, and delete competitor/target.

The main problem is state ownership. `competitors`, `targets`, `reports`, `tasks`, `drafts`, and `startupRuns` are all global. `selectedCompetitorId` currently defaults to the first competitor instead of representing an explicit drilldown selection. That makes it too easy for reports, task runs, target drafts, and first-collection progress to appear outside the competitor the user thinks they are operating.

## Goals

- Make `竞品列表` the primary product entry.
- Show one selected competitor detail workspace at a time.
- Keep target recommendation, validation, first collection, baseline explanation, reports, tasks, feedback, and knowledge writeback inside the selected competitor context.
- Preserve the rule that failed validation pages never become active monitor targets.
- Keep `首次基线` distinct from generated intelligence reports.
- Keep `全部情报` as a secondary cross-competitor view.
- Remove global task browsing from the primary UI; task runs are shown under competitor detail.

## Non-Goals

- No database persistence change.
- No scheduler implementation.
- No AI analyzer or diff algorithm change.
- No full automated competitor discovery.
- No new route requirement in this iteration.
- No chat or MCP workflow change.

## Recommended Architecture

Use a single-route split-view now, with future route boundaries baked in.

```text
/intelligence
  CompetitorListPane
    - add competitor
    - select competitor
    - per-competitor status/counts

  CompetitorDetailPane(selectedCompetitorId)
    - status summary and next action
    - 待确认监控页
    - 已监控目标
    - 情报报告
    - 采集任务

  AllReportsDrawerOrSection
    - secondary cross-competitor inbox
    - links back to competitor detail
```

The page can start as one Vue file if that is the lowest-risk implementation, but the logical boundaries should be explicit in computed state and helper functions. If the component becomes too large during implementation, split local components under `src/pages/intelligence/components/` without changing behavior.

## State Model

The selected competitor is the owner of all operational state.

```ts
selectedCompetitorId: Ref<number | undefined>
selectedCompetitor: ComputedRef<CompetitorVo | undefined>
selectedTargets: Ref<MonitorTargetVo[]>
selectedDrafts: Ref<DraftTarget[]>
selectedReports: Ref<ReportSummaryVo[]>
selectedTasks: Ref<TaskRunVo[]>
selectedStartupRuns: Ref<StartupRun[]>
selectedReport: Ref<ReportDetailVo | null>
```

The important rule is that draft targets and startup collection progress must be keyed by competitor. A draft created for one competitor must not remain visible when the user selects another competitor.

On competitor switch:

1. Set `selectedCompetitorId`.
2. Clear selected report detail unless the current detail belongs to the new competitor.
3. Load or derive targets, reports, and tasks for that competitor.
4. Show only drafts and startup runs belonging to that competitor.

## Detail Layout

Use vertical overview plus sections, not nested tabs.

1. Status header:
   - competitor name, homepage, positioning
   - current state
   - primary next action
   - compact counts: active targets, unread reports, latest collection

2. `待确认监控页`:
   - recommended URLs before activation
   - source/provenance label
   - validation state
   - selected checkbox
   - edit/remove/retry controls where available

3. `已监控目标`:
   - active validated pages
   - type, URL, last collected time
   - collect and delete actions

4. `情报报告`:
   - competitor-scoped reports
   - unread/priority/evidence count
   - report detail opens in the same competitor context

5. `采集任务`:
   - competitor-scoped task runs
   - status and user-readable message
   - adapter details remain secondary

## Derived Competitor State

Derive the detail header from selected competitor data:

- no active targets and no drafts: `发现并确认监控页`
- drafts exist: `确认待加入监控页`
- active targets and no baseline task: `执行首次采集`
- successful baseline task and no reports: `监控已启动，等待变化`
- reports exist: `发现 N 条变化`
- load failure: recoverable error with retry

First collection copy must say `首次基线`. It must explain that a report appears only after a later collection finds meaningful diff evidence.

## API Changes

Existing target filtering stays:

```ts
listMonitorTargets(competitorId?: number)
```

Add minimal optional filters:

```ts
listInboxReports(competitorId?: number)
listTaskRuns(competitorId?: number)
```

Backend endpoints:

```text
GET /intelligence/reports/inbox?competitorId=...
GET /intelligence/tasks?competitorId=...
```

If `competitorId` is omitted, the endpoints keep current global behavior. This preserves the secondary `全部情报` entry and avoids a breaking API change.

Task filtering should be implemented by resolving task target IDs to targets and filtering by `target.competitorId`. Reports already carry `competitorId`.

## User Flows

### Add Competitor

1. User clicks `添加竞品`.
2. Dialog saves competitor.
3. New competitor is inserted into the list and selected.
4. Detail opens for the new competitor.
5. Target recommendation runs for that competitor.
6. Recommended pages appear under `待确认监控页`.

### Start Monitoring

1. User selects validated or pending recommended pages.
2. The system saves each selected page through `createMonitorTarget`.
3. Backend validation decides whether the page becomes active.
4. Failed pages are not added to active targets.
5. Successfully saved active targets are collected.
6. Per-target progress is shown under selected competitor detail.
7. On completion, the detail shows `首次基线` or reports if diff evidence exists.

### Switch Competitor

1. User selects another competitor from the list.
2. Detail state changes to the new competitor.
3. Draft pages, targets, tasks, reports, and selected report detail from the previous competitor disappear unless they belong to the new competitor.

### Review All Reports

1. User opens secondary `全部情报`.
2. The list shows reports across competitors.
3. Each report row identifies its competitor.
4. Opening a row selects the related competitor and opens the report detail in that context.

## Error Handling

- If competitor list fails to load, show a page-level retry.
- If selected competitor detail loading fails, keep the competitor list visible and show a detail-level retry.
- If target validation fails, remove the page from active-target creation and show the validation failure as recoverable UI.
- If collection fails for one target, mark only that target run failed and continue showing other target progress.
- If report detail loading fails, keep report list context and show a retry message.

## Testing Strategy

- Run frontend build/type verification.
- Browser verify: add competitor -> selected detail -> discover pages -> start monitoring -> `首次基线` visible.
- Browser verify: create or use two competitors, switch between them, and confirm targets, drafts, tasks, reports, and selected report detail do not leak.
- Browser verify: `全部情报` can open a report and return the user to the owning competitor context.
- Browser smoke with one sample site from `/Users/kongdecheng/workspace/nova/doc/competitive-intelligence-target-sites.yaml`.
- Backend smoke: `GET /intelligence/reports/inbox?competitorId=...` and `GET /intelligence/tasks?competitorId=...` preserve global behavior when the query parameter is omitted.

## Implementation Notes

- Prefer explicit selected-competitor helpers over global computed values that silently use `competitors[0]`.
- Keep backend query parameters optional and backward compatible.
- Do not introduce mock fallback data in the real page.
- Do not turn failed validation candidates into saved draft records unless a later backend persistence design explicitly adds that behavior.
- Keep UI copy user-facing: use `待确认监控页`, `待加入监控页`, `已监控目标`, and `首次基线`.
