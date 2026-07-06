## ADDED Requirements

### Requirement: Consume AG-UI text events
The chat page SHALL append AG-UI assistant text deltas to the existing assistant message stream without replacing the Vue message renderer.

#### Scenario: Text content delta
- **WHEN** the stream receives an AG-UI `TEXT_MESSAGE_CONTENT` event with a non-empty `delta`
- **THEN** the current assistant message content is appended with that delta

#### Scenario: Text chunk event
- **WHEN** the stream receives an AG-UI `TEXT_MESSAGE_CHUNK` event with a non-empty `delta`
- **THEN** the current assistant message content is appended with that delta

### Requirement: Consume AG-UI tool-call events
The chat page SHALL map AG-UI tool-call events to the existing tool-call card state.

#### Scenario: Tool call starts
- **WHEN** the stream receives an AG-UI `TOOL_CALL_START` event
- **THEN** the UI shows a pending tool-call card using the best available tool name

#### Scenario: Tool call arguments stream
- **WHEN** the stream receives an AG-UI `TOOL_CALL_ARGS` or `TOOL_CALL_CHUNK` event for an active tool call
- **THEN** the existing pending tool-call card remains visible and stores the latest argument content as interim result data

#### Scenario: Tool call completes
- **WHEN** the stream receives an AG-UI `TOOL_CALL_END` or `TOOL_CALL_RESULT` event for an active tool call
- **THEN** the matching tool-call card is marked successful and displays the available result data

### Requirement: Consume AG-UI lifecycle events
The chat page SHALL map AG-UI lifecycle events to the existing stream completion and error behavior.

#### Scenario: Run finishes
- **WHEN** the stream receives an AG-UI `RUN_FINISHED` event
- **THEN** the stream loop stops and the current assistant message exits loading and typing states

#### Scenario: Run errors
- **WHEN** the stream receives an AG-UI `RUN_ERROR` or `ERROR` event
- **THEN** the stream loop stops and the current assistant message exits loading and typing states

### Requirement: Preserve custom SSE compatibility
The chat page SHALL continue to support the existing custom `content`, `mcp`, and `done` SSE events.

#### Scenario: Existing content event
- **WHEN** the stream receives the existing `event: content` payload
- **THEN** the current message rendering behavior remains unchanged

#### Scenario: Existing MCP event
- **WHEN** the stream receives the existing `event: mcp` payload
- **THEN** the current tool-call card behavior remains unchanged

#### Scenario: Existing done event
- **WHEN** the stream receives the existing `event: done` payload
- **THEN** the stream loop stops as before

### Requirement: Ignore unsupported AG-UI events safely
The chat page SHALL ignore unsupported AG-UI event families without throwing parser errors.

#### Scenario: Unsupported state event
- **WHEN** the stream receives an AG-UI `STATE_SNAPSHOT`, `STATE_DELTA`, `ACTIVITY_SNAPSHOT`, `ACTIVITY_DELTA`, `RAW`, or `CUSTOM` event
- **THEN** the parser continues without changing visible chat content
