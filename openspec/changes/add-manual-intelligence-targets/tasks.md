## 1. Contract And Data Model

- [x] 1.1 Inspect existing target entity, DTO, mapper, SQL migration, and frontend API types for target source and analysis notes support.
- [x] 1.2 Add nullable backend target metadata fields for `source` and `analysisNotes` if they are not already persisted.
- [x] 1.3 Extend backend target request and view DTOs while keeping existing callers compatible.
- [x] 1.4 Extend frontend `MonitorTargetVo` and `MonitorTargetRequest` types for manual target metadata.

## 2. Manual Target Entry UX

- [x] 2.1 Add a competitor-scoped manual target entry action in the detail drawer pending-target section.
- [x] 2.2 Implement the manual target form using Element Plus controls for type, title, URL, and optional analysis notes.
- [x] 2.3 Convert submitted manual target forms into pending candidates with `source = manual`.
- [x] 2.4 Keep pending manual targets editable before activation and visually distinct from discovered targets.

## 3. Validation And Activation

- [x] 3.1 Reuse backend target creation validation for manual targets.
- [x] 3.2 Ensure validation-success manual targets become active monitored targets for the selected competitor.
- [x] 3.3 Ensure validation-failed manual targets do not enter active monitoring and show the failure reason.
- [x] 3.4 Preserve RSS-specific validation behavior for manual RSS targets.

## 4. Pipeline Integration

- [x] 4.1 Ensure active manual targets appear in the competitor's monitored targets list after refresh.
- [x] 4.2 Ensure active manual targets participate in target-level collection.
- [x] 4.3 Ensure active manual targets participate in competitor one-click collection.
- [x] 4.4 Ensure first baseline, task records, diff, and reports continue to use the existing pipeline for manual targets.

## 5. Verification

- [x] 5.1 Run backend tests or focused compile checks for intelligence DTO/service changes.
- [x] 5.2 Run frontend typecheck/build for intelligence page changes.
- [x] 5.3 Smoke test a valid manual webpage target from the documented target-site list through UI activation.
- [x] 5.4 Smoke test a validation failure and confirm no active target is created.
- [x] 5.5 Verify existing recommendation-based target flow still works.
