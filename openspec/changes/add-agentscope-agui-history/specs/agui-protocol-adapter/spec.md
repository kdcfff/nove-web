## MODIFIED Requirements

### Requirement: Consume AG-UI tool-call events
The chat page SHALL map AG-UI tool-call events to message-scoped tool-call card state.

#### Scenario: Tool call starts
- **WHEN** the stream receives an AG-UI `TOOL_CALL_START` event
- **THEN** the current assistant message shows a pending tool-call card using the best available tool name

#### Scenario: Tool call arguments stream
- **WHEN** the stream receives an AG-UI `TOOL_CALL_ARGS` or `TOOL_CALL_CHUNK` event for an active tool call
- **THEN** the matching tool-call card under the current assistant message remains visible and stores the available argument content

#### Scenario: Tool call completes
- **WHEN** the stream receives an AG-UI `TOOL_CALL_END` or `TOOL_CALL_RESULT` event for an active tool call
- **THEN** the matching tool-call card under the current assistant message is marked successful and displays the available result data
