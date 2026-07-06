## Why

Competitive intelligence is not useful if users can only collect data without a place to inspect, trust, and act on it. Nova Web needs a workbench-first experience backed by the new backend APIs, while still letting users ask natural-language competitive questions in chat.

## What Changes

- Add an independent `/intelligence` route with a sidebar entry.
- Make the intelligence inbox the default first screen.
- Add standard MVP workbench views: competitor list, competitor detail, monitor target management, intelligence inbox, and intelligence report detail.
- Add empty-state onboarding that guides users to add competitors, generate or add monitor targets, and trigger first collection.
- Add a lightweight company/product profile settings entry that can be skipped.
- Support target recommendation drafts that users confirm before saving.
- Show asynchronous task run status for manual collection.
- Show report detail evidence, field-level old/new snippets, AI reason, priority, confidence, actions, read state, and feedback controls.
- Support manual knowledge writeback from report detail.
- Add a chat natural-language entry flow that uses backend APIs to read intelligence and produce analysis, with write actions limited to drafts that must be confirmed in the workbench.
- Add station-internal unread count/indicator for new intelligence; do not add external notifications.

## Capabilities

### New Capabilities

- `competitive-intelligence-workbench`: Frontend capability for intelligence workbench navigation, inbox, competitor/target management, report detail, feedback, knowledge writeback, task status, and chat Skill entry UX.

### Modified Capabilities

- None.

## Impact

- Routing/layout: `src/routers`, `src/layouts/components/Aside`, and related navigation state.
- Pages/components: new `src/pages/intelligence/**` workbench pages and shared components.
- API layer: new `src/api/intelligence/**` client and TypeScript types.
- Chat integration: chat page flow for competitive-intelligence intent, read-only analysis, and draft handoff to the workbench.
- Verification: frontend type/build checks plus smoke path for add competitor -> target -> collect -> inbox -> detail -> feedback.
