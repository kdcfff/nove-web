## Context

Nova Web currently centers on the chat experience, with static routes and a session-oriented sidebar. Competitive intelligence requires a workbench because users need durable configuration, evidence review, feedback, and manual confirmation for write operations. This frontend change is paired with backend change `competitive-intelligence-mvp`, which owns domain APIs and task execution.

The first version should feel like an operational product surface: quiet, scannable, and action-oriented. It should not become a marketing page or a purely chat-only demo.

## Goals / Non-Goals

**Goals:**

- Add a dedicated `/intelligence` workbench route and sidebar entry.
- Default the workbench to the intelligence inbox.
- Implement standard MVP views: inbox, report detail, competitors, competitor detail, monitor targets, and company profile settings.
- Let users create competitors, confirm target recommendation drafts, trigger asynchronous collection, inspect task status, and submit feedback.
- Surface evidence and AI reasoning clearly enough that users can trust or reject an intelligence report.
- Add a natural-language chat entry for reading and analyzing existing intelligence, with write operations represented as drafts requiring workbench confirmation.
- Use backend API contracts first; allow frontend mock data while backend endpoints are being implemented.

**Non-Goals:**

- Do not build a dashboard-heavy analytics homepage for the MVP.
- Do not add external notification configuration for email or IM.
- Do not allow chat to directly save competitors, targets, trigger collection, or write to knowledge without workbench confirmation.
- Do not implement social/GitHub/ads/hiring UI until backend adapters exist.
- Do not build a full Skill-management UI.

## Decisions

### Route And Navigation

Use an independent `/intelligence` route under the existing layout. The sidebar entry label is `竞品情报`. The default child view is the inbox, because the primary user question is "what changed and what should I do?"

Alternatives considered:

- Put the workbench inside chat: rejected because configuration and evidence review need more space than the chat session layout provides.
- Hide the route and make it URL-only: rejected because this is a product capability, not an internal demo.

### Workbench Information Architecture

The workbench has five primary surfaces:

- Inbox: newest/highest-priority intelligence, filters, unread state, empty-state onboarding.
- Report detail: evidence chain, old/new snippets, AI reasoning, recommended actions, feedback, knowledge writeback.
- Competitors: competitor CRUD and summary.
- Competitor detail: profile, monitor targets, recent changes, reports.
- Monitor targets: target CRUD, recommendation drafts, manual collect action, task status.

Company/product profile is a settings drawer or page available from the workbench. It is optional; missing profile state displays a prompt explaining that profile context improves impact and action recommendations.

### Data Flow

The frontend uses `src/api/intelligence` as the contract boundary. API functions are domain-oriented:

- `getCompanyProfile`, `updateCompanyProfile`
- `listCompetitors`, `createCompetitor`, `updateCompetitor`, `deleteCompetitor`, `getCompetitorDetail`
- `listMonitorTargets`, `createMonitorTarget`, `updateMonitorTarget`, `deleteMonitorTarget`, `recommendMonitorTargets`, `triggerTargetCollect`
- `listInboxReports`, `getReportDetail`, `markReportRead`, `submitReportFeedback`, `writeReportToKnowledge`
- `listTaskRuns`, `getTaskRunDetail`
- read-only chat analysis endpoints for competitor search, report retrieval, evidence retrieval, and comparisons

During parallel backend/frontend development, the frontend can use local mock fixtures shaped exactly like these API types. The final implementation switches to real endpoints without changing page state shape.

### Chat Entry

Chat supports natural-language competitive intelligence queries. The frontend should display the analysis result in the chat stream and link to relevant workbench reports or draft actions. Chat may propose draft competitors or monitor targets, but saving still happens in the workbench confirmation flow.

### Visual And Interaction Design

The workbench should be dense and operational:

- Inbox rows/cards emphasize priority, competitor, target type, summary, evidence count, confidence, and unread state.
- Report detail puts evidence before or beside AI reasoning; old/new snippets must be visible.
- Feedback controls are clear actions: useful, not useful, false positive, handled.
- Empty state guides users to add a competitor, generate or add targets, and trigger first collection.
- Target recommendation drafts are selectable and editable before saving.

## Risks / Trade-offs

- Backend may not be ready while frontend starts -> use typed mock fixtures matching the agreed API contract.
- Existing sidebar is chat-session oriented -> add the intelligence entry with minimal layout churn and avoid redesigning chat navigation.
- Evidence-heavy report detail can become cluttered -> group evidence, AI reasoning, and actions into clear sections.
- Chat write drafts can confuse users -> every draft must show an explicit "confirm in workbench" handoff.
- Unread count requires backend support -> fall back to inbox unread field and refresh after report read actions.

## Migration Plan

1. Add route and sidebar entry.
2. Add API client/types and mock fixtures.
3. Build inbox and empty state first.
4. Build competitor and target management with recommendation draft confirmation.
5. Build report detail, feedback, and knowledge writeback actions.
6. Add chat natural-language read flow and draft handoff links.
7. Switch mock fixtures to backend APIs and run build/smoke verification.

Rollback is route-level: remove the `/intelligence` route/sidebar entry and API imports. Existing chat pages remain intact.

## Open Questions

- Exact backend endpoint paths may be adjusted during backend implementation, but TypeScript API function names and data shapes should remain stable.
- Final unread count placement depends on sidebar layout constraints.
