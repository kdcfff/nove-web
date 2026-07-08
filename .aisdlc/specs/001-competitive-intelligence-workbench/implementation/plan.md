# 竞品情报前端工作台实现计划（SSOT）

> **必需技能：** `spec-execute`
> **上下文获取：** 必须先执行 `spec-context` 获取上下文，定位 `{FEATURE_DIR}`，失败即停止

**目标：** 交付竞品列表驱动的 `/intelligence` 工作台。  
**范围：** In: 路由、API、页面状态、详情、目标、任务、报告、反馈；Out: 后端重构。  
**架构：** Vue page + typed API client + scoped competitor state。  
**验收口径：** AC-WB-001 至 AC-WB-005。  
**影响范围：** `src/pages/intelligence/index.vue`、`src/api/intelligence/*`、`src/routers/modules/staticRouter.ts`。  
**需遵守的不变量：** 竞品 scoped data、baseline/report 区分、evidence-first。  
**子仓范围：** 无。

---

## Traceability Matrix

| AC | Plan Task | Code Evidence | Test Evidence | Report |
|---|---|---|---|---|
| AC-WB-001 | T1 | `staticRouter.ts`, `index.vue` | browser smoke | `verification/report-2026-07-08-v1.md` |
| AC-WB-002 | T2 | `index.vue`, `types.ts` | browser smoke | same |
| AC-WB-003 | T3 | `createMonitorTarget`, `triggerTargetCollect` | smoke/API | same |
| AC-WB-004 | T4 | `listTaskRuns`, task table | smoke | same |
| AC-WB-005 | T5 | package scripts | `pnpm build` | same |

## 任务清单（SSOT）

### Task T1: 路由和 API 契约

- [x] **状态**：完成

**文件：**
- `src/routers/modules/staticRouter.ts`
- `src/api/intelligence/index.ts`
- `src/api/intelligence/types.ts`

**验证：**
- Run: `pnpm build`
- Expected: PASS

### Task T2: 竞品列表和详情

- [x] **状态**：完成

**文件：**
- `src/pages/intelligence/index.vue`

**验收点：**
- 用户打开竞品详情后，targets/tasks/reports 都按 competitorId scoped。
- 切换竞品不会保留旧数据。

### Task T3: 监控目标和采集

- [x] **状态**：完成

**验收点：**
- 支持待确认监控页、手动目标、保存、采集。
- active target 显示 URL、类型、状态、操作。

### Task T4: 采集历史、报告和调度

- [x] **状态**：完成

**验收点：**
- 采集历史显示 trigger source/status/time/compare/report。
- 定时配置保存后刷新目标行。

### Task T5: 构建与浏览器 smoke

- [ ] **状态**：待验证

**验证：**
- Run: `pnpm build`
- Browser: `/intelligence -> 查看详情 -> 定时 -> 采集 -> 采集历史`

## NEEDS CLARIFICATION

- 无产品阻断问题。浏览器 smoke 依赖服务 cwd 与本 worktree 匹配。
