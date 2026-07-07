## Why

Competitive intelligence setup currently depends on recommended monitoring pages. When automatic discovery misses a pricing page, customer story, docs page, RSS feed, or other user-known target, the user cannot explicitly add that target into the verified monitoring and analysis pipeline from the competitor detail workflow.

This change lets users define their own competitor monitoring targets while preserving the core product rule: a target must be validated before it becomes an active monitored target and feeds collection, baseline, diff, reports, and custom competitor analysis.

## What Changes

- Add a manual target entry path in the competitor detail workflow.
- Let users enter target type, title, URL, and optional analysis notes for a competitor-specific monitoring target.
- Mark manually entered targets as manual-source candidates before activation.
- Reuse the existing backend target creation validation so failed targets do not become active monitored targets.
- Feed validated manual targets into the existing collection, first baseline, field-level diff, report, task history, and one-click collection flows.
- Show validation failures in the same candidate-target area instead of silently adding invalid targets.
- No breaking changes.

## Capabilities

### New Capabilities
- `manual-intelligence-targets`: Users can add competitor-specific monitoring targets manually, validate them, and activate them into the competitive intelligence pipeline.

### Modified Capabilities
- None.

## Impact

- Frontend competitive intelligence workbench:
  - `/Users/kongdecheng/workspace/nova/nova-web/src/pages/intelligence/index.vue`
  - `/Users/kongdecheng/workspace/nova/nova-web/src/api/intelligence/types.ts`
  - `/Users/kongdecheng/workspace/nova/nova-web/src/api/intelligence/index.ts`
- Backend competitive intelligence API and contract may need minor DTO or persistence support if analysis notes or target source must be stored:
  - `/Users/kongdecheng/workspace/nova/nova-backend/nova-modules/nova-intelligence/src/main/java/org/ruoyi/intelligence/controller/IntelligenceController.java`
  - `/Users/kongdecheng/workspace/nova/nova-backend/nova-modules/nova-intelligence/src/main/java/org/ruoyi/intelligence/service/IntelligenceService.java`
  - `/Users/kongdecheng/workspace/nova/nova-backend/nova-modules/nova-intelligence/src/main/java/org/ruoyi/intelligence/domain/IntelligenceDtos.java`
- Existing target validation, collection, snapshot, diff, report, and task-run behavior must continue to work for recommended and manual targets.
