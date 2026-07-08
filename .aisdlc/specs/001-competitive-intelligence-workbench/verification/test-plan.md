# 竞品情报前端工作台测试计划

## Summary

验证 `/intelligence` 工作台的构建、竞品详情、监控目标、定时、采集历史和报告动作。

## Scope

In: `pnpm build`、浏览器 smoke、核心路径验证。  
Out: 后端采集算法正确性。

## Entry Criteria

- 前端分支 `001-competitive-intelligence-workbench`。
- 后端服务属于匹配 worktree 或明确记录未执行 smoke。

## Exit Criteria

- `pnpm build` 通过。
- smoke 路径完成或记录阻塞原因。
- 截图/观察点写入报告。

## Test Types

| Type | Command/Path | Coverage |
|---|---|---|
| Build | `pnpm build` | AC-WB-005 |
| Smoke | `/intelligence` | AC-WB-001..004 |
| State | switch competitors | scoped state invariant |

## Traceability

- Requirements: `../requirements/prd.md`
- Plan: `../implementation/plan.md#traceability-matrix`
