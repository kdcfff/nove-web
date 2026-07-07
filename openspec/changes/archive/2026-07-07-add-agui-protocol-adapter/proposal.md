## Why

Nova Web currently consumes a custom `/chat/send` SSE stream with `content`, `mcp`, and `done` events. AG-UI is becoming the target open protocol for agent-to-frontend interaction, so the chat page needs a compatibility layer that can consume AG-UI events without replacing the existing Vue UI.

This change gives Nova a low-risk path to AG-UI interoperability while preserving the current session, model, knowledge base, markdown, reasoning, and tool-call display behavior.

## What Changes

- Add a Vue-side AG-UI event adapter for the existing chat stream parser.
- Map AG-UI text events into the existing assistant message streaming renderer.
- Map AG-UI tool-call events into the existing `ToolCallCard` state model.
- Map AG-UI lifecycle completion and error events into the current loading/typing termination flow.
- Keep the current custom SSE protocol working during the transition.
- Do not replace the Vue chat page with CopilotKit or assistant-ui in this change.

## Capabilities

### New Capabilities

- `agui-protocol-adapter`: Frontend compatibility for AG-UI streaming events in the existing Nova Vue chat page.

### Modified Capabilities

- None.

## Impact

- Affected frontend code:
  - `src/pages/chat/layouts/chatWithId/index.vue`
  - `src/pages/chat/layouts/chatWithId/types.ts`
  - New adapter module under `src/pages/chat/layouts/chatWithId/` or `src/utils/`
- Affected behavior:
  - Streaming text rendering
  - Reasoning/loading state completion
  - Tool-call display cards
  - SSE end/error handling
- No backend API contract change is required for the first implementation path.
- No new React runtime, iframe, CopilotKit component, or assistant-ui dependency is introduced.
