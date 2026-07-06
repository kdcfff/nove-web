## ADDED Requirements

### Requirement: Bind tool calls to assistant messages
The chat UI SHALL display AG-UI tool-call cards under the assistant message that produced them.

#### Scenario: Live tool call belongs to current assistant message
- **WHEN** a live AG-UI `TOOL_CALL_START` event arrives during an assistant response
- **THEN** the tool-call card is attached to the current assistant message

#### Scenario: Multiple assistant messages have separate tool calls
- **WHEN** a session contains multiple assistant messages with agent events
- **THEN** each assistant message displays only its own tool-call cards

### Requirement: Restore tool cards from persisted events
The chat UI SHALL restore static tool-card state from `agentEvents` returned with message history.

#### Scenario: History message includes tool events
- **WHEN** `/system/message/list` returns an assistant message with ordered `agentEvents`
- **THEN** the frontend folds those events into tool-call cards under that message

#### Scenario: Tool completed in history
- **WHEN** persisted events include `TOOL_CALL_START`, argument events, and `TOOL_CALL_RESULT` or `TOOL_CALL_END`
- **THEN** the historical card is shown as completed with the available argument/result data

#### Scenario: Run failed in history
- **WHEN** persisted events include `RUN_ERROR`
- **THEN** the historical display indicates the agent run failed without breaking the message list

### Requirement: Preserve live AG-UI compatibility
The chat UI SHALL continue to consume live AG-UI text, reasoning, lifecycle, and unsupported event families safely.

#### Scenario: Existing text streaming
- **WHEN** a live AG-UI text delta arrives
- **THEN** the assistant message content is appended as before

#### Scenario: Unsupported event
- **WHEN** an unsupported AG-UI event appears in live or historical data
- **THEN** the frontend ignores it without throwing

### Requirement: Preserve normal chat history
Normal chat sessions without persisted AG-UI events SHALL render unchanged.

#### Scenario: Message has no agent events
- **WHEN** a historical message lacks `agentEvents`
- **THEN** it renders as a normal chat message without tool cards
