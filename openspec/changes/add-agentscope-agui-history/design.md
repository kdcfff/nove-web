## Context

The frontend already has an AG-UI adapter in the chat page and a `ToolCallCard` component. It can display live tool calls, but the state is held in a global `toolCallEvents` list that is cleared when sessions change. The new backend AgentScope runtime will persist AG-UI events and return them with assistant messages from `/system/message/list`.

This change is coordinated with backend change `add-agentscope-agui-runtime`.

## Goals / Non-Goals

**Goals:**

- Show live AgentScope tool calls under the current assistant message.
- Show historical tool calls under the assistant message that produced them.
- Reuse the existing AG-UI adapter and `ToolCallCard`.
- Restore final tool-card state from persisted event sequences.
- Keep normal chat history rendering unchanged.

**Non-Goals:**

- Do not replace the chat page with CopilotKit or assistant-ui.
- Do not implement animated event replay.
- Do not implement frontend tool execution or generative UI.
- Do not add a second history request for agent events in the first version.

## Decisions

### Message-Scoped Tool Calls

`MessageItem` should include `toolCalls?: ToolCallInfo[]`. The chat renderer displays those cards immediately below the owning assistant bubble. This fixes the current ambiguity where a global list cannot represent multiple historical agent replies.

### Live Stream Mapping

When a live AG-UI tool event arrives, the chat page updates the current assistant message's `toolCalls`. The existing AG-UI adapter still normalizes protocol events, but storage moves from global page state to message-local state.

### History Mapping

`ChatMessageVo` may include `agentEvents`. The chat store converts backend messages to UI messages and folds each assistant message's event sequence into final `ToolCallInfo[]` state.

The folding algorithm should:

- Create pending cards from `TOOL_CALL_START`.
- Append or replace argument data from `TOOL_CALL_ARGS` / `TOOL_CALL_CHUNK`.
- Mark success and store result data from `TOOL_CALL_RESULT` / `TOOL_CALL_END`.
- Mark error when the sequence includes `RUN_ERROR` or a tool-level error event shape.
- Ignore unsupported AG-UI events safely.

### Static Replay

History replay is static. The final state should be visible immediately after session load. No timing or animation metadata is required for the first version.

## Implementation Plan

1. Extend chat API/types with `agentEvents`.
2. Extend message UI type with `toolCalls`.
3. Extract/reuse a pure helper that folds AG-UI event sequences into `ToolCallInfo[]`.
4. Update live AG-UI handling to attach tool updates to the current assistant message.
5. Update history mapping in the chat store to restore message-scoped tool cards.
6. Update chat rendering so each assistant message can render its own cards below the bubble.
7. Verify live streaming, history reload, normal chat, and unsupported events.

## Risks / Trade-offs

- The current chat component is large. Keep the event folding helper separate from Vue rendering code.
- Long tool results may clutter history. Reuse existing card behavior and add truncation/collapse only if needed during implementation.
- Existing cached `chatMap` entries may lack `toolCalls`. Treat missing fields as empty arrays.
