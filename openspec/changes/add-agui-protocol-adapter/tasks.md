## 1. Adapter

- [x] 1.1 Add AG-UI event type definitions and normalization helper.
- [x] 1.2 Map AG-UI text events to the existing content chunk path.
- [x] 1.3 Map AG-UI tool-call events to the existing tool-call card state shape.
- [x] 1.4 Map AG-UI lifecycle/error events to stream completion.

## 2. Vue Integration

- [x] 2.1 Wire the adapter into `handleDataChunk` for both SSE JSON payloads and direct object chunks.
- [x] 2.2 Keep existing `content`, `mcp`, and `done` custom SSE branches intact.
- [x] 2.3 Preserve loading, typing, and reasoning completion behavior.

## 3. Verification

- [x] 3.1 Confirm no focused test script exists and cover the adapter with build/typecheck verification.
- [x] 3.2 Run typecheck/build or the closest available frontend verification command.
- [x] 3.3 Validate that OpenSpec change artifacts pass `openspec validate`.
