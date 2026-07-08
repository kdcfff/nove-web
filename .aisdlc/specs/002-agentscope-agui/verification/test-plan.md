# AgentScope AG-UI 前端历史回放测试计划

## Summary

验证前端能在实时和历史聊天中按 assistant message 展示 AG-UI 工具卡。

## Scope

In: build、live smoke、history reload smoke、normal chat regression。  
Out: 后端 AgentScope runtime 正确性。

## Entry Criteria

- 分支 `002-agentscope-agui`。
- 后端 `/system/message/list` 能返回 `agentEvents` 或有可复现测试数据。

## Exit Criteria

- `pnpm build` 通过。
- live AgentScope 工具卡出现于当前 assistant message。
- 重新打开 session 后工具卡仍在对应历史 message 下。
- 普通聊天不受影响。

## Test Types

| Type | Command/Path | Coverage |
|---|---|---|
| Build | `pnpm build` | AC-AGW-004 |
| Live smoke | chat thinking tool call | AC-AGW-002 |
| History smoke | reload session | AC-AGW-001 |
| Regression | normal chat | AC-AGW-003 |

## Traceability

- Requirements: `../requirements/prd.md`
- Plan: `../implementation/plan.md#traceability-matrix`
