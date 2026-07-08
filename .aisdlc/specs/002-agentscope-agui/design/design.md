# AgentScope AG-UI 前端历史回放设计决策

## Context

前端已有 AG-UI adapter 和 ToolCallCard，但历史工具状态不能绑定到 message。后端现在能返回 `agentEvents`，前端需要将其折叠成 message-scoped tool cards。

## C4

### L1 System

Nova Web 加载聊天历史并展示后端持久化的 AG-UI 工具事件。

### L2 Containers

- chat API types
- Pinia chat store
- chat page
- AG-UI adapter/helper

### L3 Components

- `AgentRunEventVo`
- `foldAgentEventsToToolCalls`
- `MessageItem.toolCalls`
- live `handleAguiEvent`
- `ToolCallCard`

## Key Decisions

### D-AGW-001: Message-scoped toolCalls

把 `toolCalls` 放到 MessageItem，解决历史多回复串台问题。

### D-AGW-002: Folding helper 纯函数

AG-UI event sequence 到 ToolCallInfo 的转换独立于 Vue，便于复用和测试。

### D-AGW-003: Static history replay

历史加载直接展示最终状态，不依赖事件时间轴动画。

## Risks And Validation

| Risk | Mitigation | Validation |
|---|---|---|
| 历史事件 shape 变化 | helper 容错字段解析 | smoke with persisted events |
| 普通聊天破坏 | missing agentEvents -> [] | normal chat smoke |
| 大工具结果挤压 UI | 复用 ToolCallCard | visual smoke |

## Traceability

- Requirements: `../requirements/prd.md`
- Plan: `../implementation/plan.md`
- Verification: `../verification/test-plan.md`
