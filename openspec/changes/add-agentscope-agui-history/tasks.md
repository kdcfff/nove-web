## 1. Types And Helpers

- [ ] 1.1 Extend `ChatMessageVo` type with optional ordered `agentEvents`.
- [ ] 1.2 Extend `MessageItem` with optional `toolCalls`.
- [ ] 1.3 Add a pure helper to fold AG-UI event sequences into `ToolCallInfo[]`.
- [ ] 1.4 Add or update focused tests for the folding helper if the project test setup supports it.

## 2. Live Chat Rendering

- [ ] 2.1 Change live AG-UI tool updates to mutate the current assistant message's `toolCalls`.
- [ ] 2.2 Remove or retire global tool-call rendering for new AgentScope flows.
- [ ] 2.3 Render `ToolCallCard` lists below the owning assistant message.
- [ ] 2.4 Preserve existing text, reasoning, loading, typing, and normal chat behavior.

## 3. Historical Replay

- [ ] 3.1 Update `chatStore.requestChatList` mapping to read backend `agentEvents`.
- [ ] 3.2 Restore message-scoped tool cards when a historical session is opened.
- [ ] 3.3 Ensure multiple assistant messages in one session each show only their own tool calls.
- [ ] 3.4 Ensure missing or unsupported AG-UI events do not break history rendering.

## 4. Verification

- [ ] 4.1 Run frontend build/typecheck.
- [ ] 4.2 Verify a live AgentScope run shows tool cards under the current answer.
- [ ] 4.3 Verify reloading the same session restores the tool cards under the historical answer.
- [ ] 4.4 Verify normal chat sessions without `agentEvents` render unchanged.
