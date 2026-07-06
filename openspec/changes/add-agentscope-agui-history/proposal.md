## Why

Nova Web can consume live AG-UI events, but tool-call state is currently treated like a transient stream artifact. AgentScope mode requires tool/process events to remain visible when users reopen a historical chat session.

## What Changes

- Bind tool-call cards to the assistant message that produced them instead of a single global list.
- Read persisted `agentEvents` returned with `/system/message/list`.
- Restore static tool-card state from saved AG-UI events when loading history.
- Keep the existing live AG-UI adapter for streaming AgentScope events.
- During live streaming, attach tool updates to the current assistant message so the same render path works for live and historical chats.
- Do not implement animated replay; historical sessions show the final restored state.

## Capabilities

### New Capabilities

- `agui-history-replay`: Frontend capability for displaying persisted AG-UI tool/process events under their related assistant message during live streaming and historical chat loading.

### Modified Capabilities

- `agui-protocol-adapter`: Extend the existing AG-UI consumption behavior so tool updates are message-scoped and compatible with persisted history.

## Impact

- Chat types: `ChatMessageVo`, `MessageItem`, and `ToolCallInfo` gain event/history linkage fields.
- Chat store: `requestChatList` maps backend `agentEvents` into message-scoped tool cards.
- Chat page: live AG-UI tool updates attach to the current assistant message instead of a global tool list.
- UI rendering: `ToolCallCard` lists render below the corresponding assistant bubble.
- API contract: `/system/message/list` assistant messages may include ordered `agentEvents`.
