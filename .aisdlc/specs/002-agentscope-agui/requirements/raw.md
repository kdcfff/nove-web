# AgentScope AG-UI 前端历史回放

## 原始来源
- OpenSpec change: `openspec/changes/add-agentscope-agui-history`
- 相关归档：`archive/2026-07-07-add-agui-protocol-adapter`

## 交付目标
让 Nova Web 在实时聊天和历史聊天中都能展示 AgentScope AG-UI 工具/过程事件，工具卡片绑定到产生它们的 assistant message。

## 范围 In
- 读取 `/system/message/list` 返回的 `agentEvents`。
- 把 AG-UI 事件恢复为 message-scoped tool cards。
- 实时流中把工具更新挂到当前 assistant message。
- 历史会话展示最终状态，不做动画重放。

## 范围 Out
- 不替换现有 Vue 聊天页面。
- 不引入 React CopilotKit 或 assistant-ui。
- 不实现历史动画 replay。

## 初始验收口径
- AC-AGW-001: 历史 assistant message 能展示持久化工具卡。
- AC-AGW-002: 实时 AG-UI 工具更新与历史恢复使用同一渲染模型。
- AC-AGW-003: 普通 SSE 文本、reasoning、done/error 行为保持兼容。
- AC-AGW-004: 前端 build 通过，聊天历史 smoke 可复现。
