# AgentScope AG-UI 前端历史回放方案决策

## Confirmed Decisions

- 前端继续使用现有 Vue 聊天页，不引入 CopilotKit/assistant-ui。
- `agentEvents` 从 `/system/message/list` 随 assistant message 返回。
- 工具卡片绑定到产生它们的 assistant message，不再依赖全局工具列表。
- 历史回放是静态最终态，不做动画 replay。

## Recommended Solution

扩展 chat API/types 和 MessageItem，新增纯函数 `foldAgentEventsToToolCalls`，将后端 ordered AG-UI events 折叠为 `ToolCallInfo[]`。实时流中也更新当前 assistant message 的 `toolCalls`，让实时和历史使用同一渲染模型。

## Alternatives

- 全局 toolCallEvents: 不选，无法表达多条历史 assistant message。
- 重新请求事件详情: 不选，增加首版复杂度。
- 动画 replay: 不选，MVP 只需恢复最终态。

## Acceptance Criteria

- AC-AGW-001: 历史 assistant message 能展示持久化工具卡。
- AC-AGW-002: 实时 AG-UI 工具更新与历史恢复使用同一渲染模型。
- AC-AGW-003: 普通 SSE 文本、reasoning、done/error 行为保持兼容。
- AC-AGW-004: 前端 build 通过，聊天历史 smoke 可复现。

## Impact Analysis

### Affected Modules

- `src/api/chat/types.ts`: `ChatMessageVo.agentEvents` 和 `AgentRunEventVo`。
- `src/stores/modules/chat.ts`: 历史消息 mapping。
- `src/pages/chat/layouts/chatWithId/aguiAdapter.ts`: event folding helper。
- `src/pages/chat/layouts/chatWithId/index.vue`: message-scoped live tool cards。
- `ToolCallCard.vue`: 复用已有卡片渲染。

### Invariants

- 没有 `agentEvents` 的普通聊天不能报错。
- Unsupported AG-UI event 必须安全忽略。
- 多个 assistant message 的工具卡互不串台。
- 工具结果过长时沿用现有 card 展示/折叠策略。

### Code Evidence

- `src/api/chat/types.ts`
- `src/stores/modules/chat.ts`
- `src/pages/chat/layouts/chatWithId/aguiAdapter.ts`
- `src/pages/chat/layouts/chatWithId/index.vue`
- `src/pages/chat/layouts/chatWithId/components/ToolCallCard.vue`

## Context Gaps

- 前端项目测试脚本有限，最终以 `pnpm build` 和浏览器 smoke 为主。

## Verification Checklist

- V-AGW-001: `pnpm build`。
- V-AGW-002: live AgentScope 工具调用显示在当前回复下。
- V-AGW-003: 重新打开同一 session，历史工具卡显示在对应 assistant message 下。
- V-AGW-004: 普通聊天无 `agentEvents` 时渲染正常。

## Iteration Log

- 2026-07-08: 从 OpenSpec history replay change 映射为 AI-SDLC solution。
