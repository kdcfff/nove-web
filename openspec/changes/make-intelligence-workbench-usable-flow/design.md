## Confirmed Grill Me Decisions

This change supersedes the earlier inbox-first assumption for the first usable frontend iteration.

1. The first screen is monitoring overview plus next-step action, not a raw inbox.
2. Use a hybrid "guide + workbench" model.
3. After adding a competitor, automatically move into target discovery.
4. Rule-generated but failed candidates are shown as failed drafts, not hidden and not saved.
5. First collection output is a baseline artifact, not an empty inbox.
6. After baseline, primary action is enabling/setting monitoring cadence; manual collection remains secondary.
7. MVP may show monitoring frequency state without pretending real SnailJob scheduling is already connected.
8. Tabs use user-oriented language: overview, reports, competitors/targets, task records.
9. Report detail prioritizes conclusion summary plus evidence diff before AI interpretation.
10. The collection button text remains `采集`.
11. Saving a competitor auto-enters target discovery.
12. Verified high-confidence targets are selected by default.
13. Returning users still see current state and next action.
14. Task records default to understandable outcomes; adapter/HTTP/markdown details are secondary.
15. Target source/provenance must be visible.
16. Rule fallback targets that validate successfully may be selected, but must be labeled as `规则补全 · 已验证`.
17. Automatic mock fallback is removed from the real page.
18. Self-product profile is not required for MVP.
19. Competitors may be saved even if homepage validation fails, but monitoring cannot start until targets validate.
20. All active monitor targets must pass validation, regardless of source.
21. MVP does not allow forced monitoring for failed targets.
22. One-click start monitoring means saving selected verified targets and running first collection.
23. A target management page remains for maintenance, not the primary first-use path.
24. First monitoring collects all selected verified targets.
25. First collection progress is shown per target as it runs.
26. After first collection, remain on overview and show result summary.
27. If baselines exist and no reports exist, top state is `监控已启动，等待变化`.
28. If reports exist, top state is `发现 N 条新变化`.
29. Feedback labels become `有帮助`, `不相关`, `这是误报`, `已处理`.
30. Knowledge writeback remains but is secondary, not the main report action.
31. Chat can read and link to workbench, but write actions stay in workbench confirmation.
32. First implementation scope is the usable flow only.

## Information Architecture

Primary tabs:

- `监控概览`: current state, next action, setup/start monitoring flow, baseline results.
- `情报报告`: report inbox and evidence-first detail.
- `竞品与目标`: competitor list, target list, manual maintenance, target discovery.
- `任务记录`: collection history with user-facing outcome by default.

## State Model

The overview should derive one of these states:

- No competitor: `先添加一个竞品`
- Competitor exists but no target: `发现并确认监控目标`
- Targets exist but no baseline/task: `执行首次采集`
- Baseline exists but no report: `监控已启动，等待变化`
- Reports exist: `发现 N 条新变化`
- API failure: `加载失败` with retry; no mock data.

## Start Monitoring Flow

```text
Add competitor
  -> close dialog
  -> switch to overview
  -> run target recommendation
  -> show target candidates
  -> user reviews/edits
  -> user clicks 开始监控
  -> save selected verified targets
  -> collect every saved selected target
  -> show per-target progress
  -> show baseline summary
```

Until backend returns real provenance and validation metadata, the frontend may infer conservative labels:

- Recommendation endpoint candidates are `规则补全`.
- Saved targets are `已验证` only if backend accepted creation.
- Failed creations remain as drafts with `验活失败`.

## UX Copy Principles

- Do not lead with "暂无情报" after first collection.
- Use "首次基线" for first scan output.
- Explain that reports require later diff.
- Keep `采集` as the action label, but describe what collection produces in nearby status text.
- Make failure reasons visible and recoverable.

## Verification

Minimum browser verification:

- First load with no real backend response shows error/retry, not mock content.
- Add competitor opens/uses dialog and moves user into discovery.
- Start monitoring saves selected targets and collects all saved targets.
- Baseline result appears as `监控已启动，等待变化` when no reports exist.
- Existing reports make the overview prioritize report review.
