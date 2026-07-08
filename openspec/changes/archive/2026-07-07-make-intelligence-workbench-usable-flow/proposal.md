## Why

The current competitive intelligence page exposes backend objects rather than a user task flow. Users can see competitors, targets, tasks, and reports, but they cannot tell what to do first, what a successful first collection means, why no report appears after a baseline, or whether a target URL was discovered, guessed, validated, or merely mocked.

This makes the product feel unusable even when the backend capture pipeline is working. The workbench must guide users through starting monitoring and then explain the current monitoring state.

## What Changes

- Replace inbox-first default with a monitoring overview and next-step flow.
- Keep a workbench model, but make the first screen answer: "Where is monitoring right now, and what should I do next?"
- Remove automatic mock fallback from the user-facing page.
- Add a competitor creation flow that immediately moves users into target discovery.
- Show candidate target provenance and validation state when available, with a clear fallback label for rule-generated candidates.
- Support a primary `开始监控` action that saves selected verified targets and performs first collection for all selected targets.
- Show first collection progress per target instead of a single blocking loader.
- After first collection, show "监控已启动，等待变化" and explain that baselines are not reports.
- Keep report detail evidence-first: summary, old/new diff evidence, impact, actions, feedback, then secondary knowledge writeback.

## Capabilities

### Modified Capabilities

- `competitive-intelligence-workbench`: The frontend workbench becomes a guided monitoring-start flow plus ongoing operational overview, rather than a technical table/inbox surface.

## Impact

- `src/pages/intelligence/index.vue`
- `src/api/intelligence/types.ts` if optional candidate metadata fields are introduced later.
- Browser verification for first-use flow:
  - add competitor
  - discover candidates
  - save verified targets
  - collect all selected targets
  - show baseline results
  - show report detail evidence-first when reports exist

## Out Of Scope

- Real SnailJob scheduling UI beyond a visible "frequency state" placeholder.
- External notifications.
- Mandatory self-product profile.
- Chat write operations.
- Complex charts.
- New component library.
