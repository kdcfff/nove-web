## Grill Me Decision Log

This record preserves the product and architecture decisions confirmed during the Grill Me session before implementation. Treat these as source-of-truth constraints for the frontend workbench unless a later OpenSpec change explicitly supersedes them.

## Confirmed Product Shape

- The MVP must include both backend and frontend; a backend-only migration is not acceptable.
- The product shape is workbench-first, with chat/agent as an additional natural-language entry.
- The workbench must include intelligence inbox, report detail, competitor list/detail, and monitor target management.
- `/intelligence` is an independent product route. The first screen is the intelligence inbox.
- Empty state must guide users to add a competitor, generate or add monitor targets, and trigger the first collection.

## Confirmed Source And Capture Scope

- MVP sources are webpage URL plus RSS/Atom.
- URL targets cover official site, pricing, docs, blog, changelog, and related competitor pages.
- RSS/Atom targets cover blog, changelog, release notes, and announcement feeds.
- Webpage capture should use Firecrawl first.
- Java HTTP/jsoup fallback is required so local/basic deployments still work without Firecrawl.

## Confirmed Diff And Intelligence Model

- Diff must be text-block and field-level, not only page-hash level.
- Normalized snapshot fields include title, headline, mainText, links, priceLikeText, and featureLikeText.
- Report details must show old value, new value, changed field, evidence snippets, and source URL.
- Rule-based scoring must run before AI analysis to reduce cost and false positives.
- AI report output must include change summary, strategic intent, business impact, recommended actions, priority, confidence, evidence, and reason.
- The analyzer must support a real model path and deterministic mock fallback for tests or missing model configuration.

## Confirmed Workflow And Safety

- Manual collection and SnailJob scheduled collection must share the same backend pipeline.
- Collection must run asynchronously through task runs.
- All business data must be tenant-scoped.
- Feedback values are useful, not useful, false positive, and handled.
- Knowledge-base writeback is manual from high-value report detail; it is not automatic for every report.
- Raw evidence should be preserved before AI conclusions are generated.

## Confirmed Chat / Skill Direction

- MVP does not require MCP.
- Use a natural-language Skill plus backend APIs.
- Nova chat should identify competitive-intelligence intent, call backend APIs, and answer according to the Skill flow.
- Chat can generate drafts, but write actions must be confirmed in the workbench.
- Chat Skill backend APIs should be read-oriented for competitor search, report retrieval, evidence retrieval, and comparison.

## Confirmed Frontend Process

- Backend and frontend changes are split by repo.
- Backend OpenSpec change: `competitive-intelligence-mvp`.
- Frontend OpenSpec change: `competitive-intelligence-workbench`.
- Verification expectation is backend unit tests, frontend build, and a core smoke path.
- API style should use domain resource APIs plus a small inbox aggregation API.
