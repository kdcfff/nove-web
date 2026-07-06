# Implementation Plan

## Phase 1: Types And Event Folding

Extend chat API and UI message types with `agentEvents` and `toolCalls`. Add a pure helper that converts ordered AG-UI events into final `ToolCallInfo[]` state.

## Phase 2: Live Message-Scoped Tool Cards

Move live tool-card updates from a global list to the current assistant message. Render cards below each assistant bubble.

## Phase 3: Historical Static Replay

Update chat store history mapping to fold backend `agentEvents` into `toolCalls` for each assistant message.

## Phase 4: Verification

Build/typecheck the frontend and verify live AgentScope tool display, historical replay, multiple assistant messages, and normal chat without events.
