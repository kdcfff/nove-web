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

- report has `competitorId` in summary/detail
- task has `targetId`, and target has `competitorId`

If this becomes brittle, add minimal query params:

- `GET /intelligence/reports/inbox?competitorId=...`
- `GET /intelligence/tasks?competitorId=...`

Rationale: the change is about product form and user flow, not backend storage or collection architecture. Minimal filters are acceptable because they preserve the existing data model and reduce frontend coupling.

### Decision 4: Rename Candidate Language For Users

The UI should avoid making `候选目标` sound like an internal entity. Use:

- `待确认监控页` for recommended URLs before activation.
- `待加入监控页` where the user is selecting pages to save.
- `已监控目标` for active validated targets.

Rationale: the user question is "which pages will be monitored?", not "what is a candidate object?"

### Decision 5: Competitor Detail Owns The First-Run State Machine

Per competitor, derive these states:

- no active targets: `发现并确认监控页`
- recommended pages available: `确认待加入监控页`
- active targets but no baseline task: `执行首次采集`
- baseline exists and no reports: `监控已启动，等待变化`
- reports exist: `发现 N 条变化`
- load failure: recoverable error with retry

Rationale: the previous global overview can be useful, but the core operational state belongs to one competitor.

### Decision 6: Keep Evidence-First Report Detail

Report detail under the competitor should still prioritize:

- summary
- source target and captured URL
- old/new field-level evidence
- impact and reasoning
- recommended actions
- feedback and knowledge writeback

Rationale: the user has repeatedly called out that "how to judge change" is the core. UI drilldown must not hide diff evidence behind generic cards.

## Risks / Trade-offs

- [Risk] Global counts may become less prominent. -> Mitigation: keep a small cross-competitor summary strip, but make it non-primary.
- [Risk] Frontend-only task scoping by target relation can become stale after deletes. -> Mitigation: refresh targets/tasks together and add backend `competitorId` filters if the join becomes unreliable.
- [Risk] A single large page component can become hard to maintain. -> Mitigation: split competitor list, competitor detail, target section, report section, and task section into local components if the implementation grows.
- [Risk] Users may still expect an all-report inbox. -> Mitigation: keep `全部情报` as a secondary view or filter, with links back into competitor detail.
- [Risk] Existing dirty changes may already include partial UI edits. -> Mitigation: build on current code without reverting unrelated work, and verify the final user path in browser.

## Migration Plan

1. Keep the current `/intelligence` route.
2. Replace the default global-tab experience with competitor list plus selected competitor detail.
3. Move add-competitor dialog result into selecting/opening the new competitor detail.
4. Scope recommendation, target creation, first collection, reports, and tasks to the selected competitor.
5. Preserve delete competitor and delete target actions in the scoped context.
6. Add minimal API query params only if client-side scoping cannot be made reliable.
7. Browser verify with one documented target site from `/Users/kongdecheng/workspace/nova/doc/competitive-intelligence-target-sites.yaml`.

Rollback: keep the current route and restore the previous tab-first page component. Backend APIs remain compatible because this change avoids structural backend rewrites.

## Open Questions

- Should the URL encode the selected competitor, such as `/intelligence/competitors/:id`, or is state-driven selection enough for the MVP?
- Should `全部情报` remain a tab, a list filter, or a top-level link?
- Should the backend add report/task `competitorId` filters now, or should frontend scoping prove sufficient first?
