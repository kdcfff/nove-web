# AgentScope AG-UI 前端历史回放 PRD

## Objective

让用户重新打开历史聊天时，仍能看到 AgentScope 工具调用过程和结果，且工具卡归属到正确 assistant message。

## Scope

In: chat types、history mapping、AG-UI folding helper、message-scoped live updates、ToolCallCard 渲染。  
Out: 动画 replay、前端工具执行、替换聊天页面。

## Acceptance Criteria

| AC | Description | Testable Signal |
|---|---|---|
| AC-AGW-001 | 历史工具卡恢复 | assistant message 下显示 tool card |
| AC-AGW-002 | 实时/历史同模型 | live updates 写入 message.toolCalls |
| AC-AGW-003 | 普通聊天兼容 | 无 agentEvents 不报错 |
| AC-AGW-004 | 构建和 smoke | `pnpm build` 与浏览器验证 |

## Business Rules

- BR-AGW-001: tool card 只能显示在 owning assistant message 下。
- BR-AGW-002: unsupported events 安全忽略。
- BR-AGW-003: history load 直接显示最终态。

## Source

- OpenSpec: `openspec/changes/add-agentscope-agui-history`
- Related: `archive/2026-07-07-add-agui-protocol-adapter`
