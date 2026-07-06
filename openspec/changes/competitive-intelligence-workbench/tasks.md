## 1. Routing And API Contract

- [ ] 1.1 Add `/intelligence` route and `竞品情报` sidebar entry
- [ ] 1.2 Add `src/api/intelligence` client functions and TypeScript types for the agreed backend contract
- [ ] 1.3 Add mock fixtures matching backend VO shapes for parallel frontend development
- [ ] 1.4 Add workbench-level state/composables for inbox filters, unread state, selected competitor, and task polling

## 2. Inbox And Onboarding

- [ ] 2.1 Build inbox default view with priority, confidence, unread state, evidence count, and recommended action summary
- [ ] 2.2 Build inbox filters for competitor, target type, priority, read state, and feedback state
- [ ] 2.3 Build empty-state onboarding actions for adding competitors, generating targets, and triggering first collection
- [ ] 2.4 Add station-internal unread indicator and read-state updates

## 3. Competitors And Targets

- [ ] 3.1 Build competitor list and create/edit/delete interactions
- [ ] 3.2 Build competitor detail with profile, targets, recent reports, and task summaries
- [ ] 3.3 Build monitor target management for official site, pricing, docs, blog, changelog, and RSS targets
- [ ] 3.4 Build target recommendation draft selection, edit, and confirm flow
- [ ] 3.5 Build manual collection trigger and asynchronous task status display

## 4. Report Detail And Profile

- [ ] 4.1 Build report detail with evidence chain, old/new snippets, AI reason, impact, and recommended actions
- [ ] 4.2 Build feedback controls for useful, not useful, false positive, and handled
- [ ] 4.3 Build manual knowledge writeback action and status display
- [ ] 4.4 Build optional company/product profile settings entry and save flow

## 5. Chat Integration And Verification

- [ ] 5.1 Add natural-language competitive intelligence chat entry using backend read APIs
- [ ] 5.2 Add draft handoff links from chat to workbench confirmation flows
- [ ] 5.3 Switch mock fixtures to real backend APIs once available
- [ ] 5.4 Run frontend type/build checks and document any environment-dependent gaps
- [ ] 5.5 Smoke the core path: add competitor -> confirm target -> trigger collect -> view inbox -> open detail -> submit feedback
