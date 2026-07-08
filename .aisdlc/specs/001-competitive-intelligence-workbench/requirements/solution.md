# 竞品情报前端工作台方案决策

## Confirmed Decisions

- 交付范围合并 `competitive-intelligence-workbench` 与 `competitor-drilldown-intelligence-workbench`。
- 主入口为 `/intelligence`，首屏以 `竞品列表 -> 竞品详情` 为核心，而不是全局 tab 优先。
- 竞品详情承载待确认监控页、已监控目标、采集历史、报告和反馈。
- 全局任务记录保留为跨竞品排障视图，不作为主流程。

## Recommended Solution

在 `src/pages/intelligence/index.vue` 中使用竞品列表驱动 selected competitor state，所有目标、任务、报告、采集和调度操作都在 selected competitor 上下文内刷新。API 边界固定在 `src/api/intelligence`，TypeScript VO 与后端契约对齐。

## Alternatives

- 继续全局 tabs: 不选，用户需要手动拼接竞品、目标、报告。
- 只做聊天入口: 不选，配置、确认和反馈需要工作台空间。
- 新建多个路由页面: 暂不选，MVP 用一个路由减少导航和权限改动。

## Acceptance Criteria

- AC-WB-001: 用户能从 `/intelligence` 进入竞品列表并打开竞品详情。
- AC-WB-002: 竞品详情展示已监控目标、target URL、调度/采集状态与操作。
- AC-WB-003: 用户能添加或确认监控页并触发采集。
- AC-WB-004: 采集历史显示触发来源、状态、开始/完成时间、对比和报告动作。
- AC-WB-005: 前端 build 通过，浏览器 smoke 可复现核心路径。

## Impact Analysis

### Affected Modules

- `src/pages/intelligence/index.vue`: 主页面、状态和交互。
- `src/api/intelligence/index.ts`: API client。
- `src/api/intelligence/types.ts`: DTO/VO 契约。
- `src/routers/modules/staticRouter.ts`: `/intelligence` 路由。

### Invariants

- 失败或未验证目标不能静默进入 active target。
- baseline 是“监控已启动，等待变化”，不是空报告。
- report detail 必须 evidence-first。
- 任务记录必须显示 trigger source，便于区分 manual/scheduled/competitor。
- 切换竞品时不得泄漏上一个竞品的 targets/tasks/reports。

### Code Evidence

- `src/pages/intelligence/index.vue`
- `src/api/intelligence/index.ts`
- `src/api/intelligence/types.ts`
- `src/routers/modules/staticRouter.ts`

## Context Gaps

- 浏览器 smoke 需要确认运行服务 cwd 与当前 worktree 一致。
- 真实后端数据和远程环境可能影响 smoke，失败必须记录为环境/服务状态。

## Verification Checklist

- V-WB-001: `pnpm build` 成功。
- V-WB-002: 浏览器打开 `/intelligence`，选择竞品并打开详情。
- V-WB-003: 在详情中验证已监控目标、定时配置、采集历史和报告/对比动作。

## Iteration Log

- 2026-07-08: 将两个 OpenSpec 合并为 AI-SDLC solution，并补齐 Impact Analysis。
