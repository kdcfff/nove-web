## 1. Specification And State

- [x] 1.1 Capture Grill Me decisions in OpenSpec.
- [x] 1.2 Remove automatic mock fallback from user-facing workbench state.
- [x] 1.3 Add derived monitoring state for no competitor, no target, no baseline, baseline/no-report, and reports exist.

## 2. Overview Flow

- [x] 2.1 Add `监控概览` as default tab.
- [x] 2.2 Add next-step panel with status-specific primary action.
- [x] 2.3 Add lifecycle steps: add competitor, confirm targets, first collection, wait for changes.
- [x] 2.4 Add baseline summary state for first collections.

## 3. Competitor And Candidate Flow

- [x] 3.1 After competitor creation, close dialog, switch to overview, and run target discovery.
- [x] 3.2 Display target candidates with source, validation state, confidence, editable URL, and selection.
- [x] 3.3 Keep failed candidates as drafts and prevent active target creation.
- [x] 3.4 Implement `开始监控` as save selected targets plus first collection for all saved targets.

## 4. Progress And Reports

- [x] 4.1 Show per-target first collection progress.
- [x] 4.2 Keep task technical details secondary.
- [x] 4.3 Preserve evidence-first report detail.
- [x] 4.4 Update feedback labels to user-facing wording.

## 5. Verification

- [x] 5.1 Run frontend build.
- [x] 5.2 Browser smoke the first-use flow with a doc sample site.
- [x] 5.3 Browser verify no mock content appears when APIs fail.
