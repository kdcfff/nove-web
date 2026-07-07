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
