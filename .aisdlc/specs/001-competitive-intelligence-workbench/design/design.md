# 竞品情报前端工作台设计决策

## Context

全局 tab 让用户需要自己理解竞品、目标、任务、报告之间的关系。新的设计把竞品作为一级对象，详情中承载完整监控闭环。

## D0 判定

结论：不跳过 design，进入 D2。

依据：本需求改变 `/intelligence` 的主操作模型、竞品详情状态机、监控目标确认、采集历史和报告入口，属于核心用户流和前后端 API 消费口径变更。按 using-aisdlc 的 D0 规则，交互结构和验收路径存在多状态分支，不能直接跳过设计。

## C4

### L1 System

Nova Web 通过 `/intelligence` 提供竞品情报工作台，调用后端 `/intelligence/**` API。

### L2 Containers

- Vue page: `src/pages/intelligence/index.vue`
- API client: `src/api/intelligence`
- Router: `src/routers/modules/staticRouter.ts`

### L3 Components

- competitor list/state
- competitor detail drawer/workspace
- draft targets and active targets
- task history and compare/report actions
- report detail feedback and knowledge writeback
- schedule dialog

## Key Decisions

### D-WB-001: 竞品优先

选择 `竞品列表 -> 竞品详情`，减少用户跨 tab 拼接对象的负担。

### D-WB-002: 详情拥有 scoped state

`detailCompetitor` 驱动 targets/tasks/reports/drafts，切换竞品时刷新并清理旧状态。

### D-WB-003: 保留全局任务记录

全局任务页用于跨竞品排障，详情内采集历史用于业务操作。

### D-WB-004: evidence-first report

报告先展示证据、old/new、来源目标，再展示 AI reason 和建议动作。

## Compatibility

- 后端 API 类型由 `src/api/intelligence/types.ts` 固定。
- 路由不破坏聊天现有入口。
- UI 使用现有 Vue/Element Plus/Vben 工程栈。

## Risks And Validation

| Risk | Mitigation | Validation |
|---|---|---|
| scoped state 泄漏 | 请求序号和 competitorId 过滤 | switch competitor smoke |
| 后端字段不齐 | unwrap 兼容 data/rows，类型可选 | build/typecheck |
| 文案混淆 baseline/report | 明确展示首次基线状态 | browser smoke |

## Traceability

- Requirements: `../requirements/prd.md`
- Plan: `../implementation/plan.md`
- Verification: `../verification/test-plan.md`
