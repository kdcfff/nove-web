## Context

The current Nova Web chat page is implemented in Vue and streams responses from `/chat/send`. The stream parser in `src/pages/chat/layouts/chatWithId/index.vue` handles custom SSE events:

- `event: content` appends assistant text and reasoning chunks.
- `event: mcp` updates tool-call cards.
- `event: done` ends the stream.

AG-UI uses standard event objects such as `TEXT_MESSAGE_CONTENT`, `TOOL_CALL_START`, `TOOL_CALL_ARGS`, `TOOL_CALL_END`, `TOOL_CALL_RESULT`, `RUN_FINISHED`, and `RUN_ERROR`. The fastest compatible path is to translate those events into the existing Vue chat state instead of replacing the page with a React chat runtime.

## Goals / Non-Goals

**Goals:**

- Preserve the existing Vue chat page and `/chat/send` stream loop.
- Add a local adapter that recognizes AG-UI event payloads.
- Map AG-UI text deltas to existing assistant message rendering.
- Map AG-UI tool-call events to existing `ToolCallCard` data.
- End or fail the stream on AG-UI lifecycle events.
- Keep the existing custom SSE protocol working.

**Non-Goals:**

- Do not introduce CopilotKit, assistant-ui, React, iframe, or microfrontend integration.
- Do not change the backend request DTO.
- Do not implement AG-UI state snapshots, generative UI, frontend tools, or MCP Apps rendering in this change.
- Do not redesign the message bubble layout.

## Decisions

### Decision: Use a frontend adapter module

Create a small TypeScript adapter near the chat page, for example `aguiAdapter.ts`. It will:

- Define the subset of AG-UI event types Nova consumes now.
- Normalize AG-UI events into a narrow internal result shape.
- Leave unknown AG-UI events ignored rather than failing the stream.

Alternative considered: adding AG-UI parsing directly inside `handleDataChunk`. This is faster by a few lines but makes the already-large Vue component more fragile.

### Decision: Preserve current custom SSE parsing

The existing protocol remains the default path. AG-UI handling is inserted only after an SSE `data:` JSON payload or direct object payload is parsed.

Alternative considered: replacing the parser with `@ag-ui/client`. That would add RxJS/client runtime behavior and conflict with the existing stream helper, making this change larger than needed.

### Decision: Keep tool state compatible with `ToolCallInfo`

AG-UI tool calls are mapped into the existing `ToolCallInfo` structure:

- Start/args events create or update a `pending` card.
- End/result events complete the card as `success`.
- Error lifecycle events do not fabricate a tool result unless a tool card is already active.

The adapter can preserve `toolCallId` internally for matching, but the UI stays with the current name/status/result display.

## Risks / Trade-offs

- [Risk] AG-UI has more event families than this first adapter supports. -> Mitigation: ignore unknown events and document state/generative UI as later work.
- [Risk] Tool-call argument chunks may arrive before a display name is final. -> Mitigation: use `toolName`, `toolCallName`, `name`, or `Unknown Tool` fallback.
- [Risk] Backend may emit SSE frames without explicit `event:` names. -> Mitigation: detect AG-UI by the JSON `type` field, independent of the SSE event name.
- [Risk] The current Vue component is large. -> Mitigation: keep parsing/mapping in a separate adapter module and limit changes in `index.vue`.

## Migration Plan

1. Add adapter types and mapping helpers.
2. Wire `handleDataChunk` to dispatch AG-UI payloads before custom protocol fallback.
3. Add lightweight tests or at least build/typecheck coverage for the adapter.
4. Verify existing custom SSE behavior remains unchanged.

Rollback is simple: remove the adapter import and AG-UI dispatch branch; the existing custom SSE parser remains intact.

## Open Questions

- Whether backend AG-UI reasoning will arrive as `REASONING_*` events or embedded text tags is not fixed yet. This change handles the standard text/tool/lifecycle subset first.
- Whether tool-call result payloads should render as raw JSON or a richer structured view is deferred to a later UI polish change.
