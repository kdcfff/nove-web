# Brainstorm Summary

- Change: competitor-drilldown-intelligence-workbench
- Date: 2026-07-07
- Phase: design brainstorming confirmed

## 已确认事实

- 产品形态改为 `竞品列表 -> 竞品详情下钻`。
- 本次范围是 frontend product shape + minimal backend filtering interfaces only。
- 不做数据库持久化、调度器、AI analyzer、采集架构大改。
- 竞品详情承载目标发现、验活、首次采集、基线、任务、报告、行动和反馈。
- 失败验活目标不得入库为 active 监控目标。
- 首次采集产物是 `首次基线`，不是情报报告；后续 diff 才生成报告。

## 当前代码观察

- `src/pages/intelligence/index.vue` 仍是 `监控概览 / 情报报告 / 竞品与目标 / 任务记录` 全局 tabs。
- `selectedCompetitorId` 目前默认取 `competitors[0]?.id`，没有真实的用户选择和下钻状态。
- target API 已支持 `listMonitorTargets(competitorId)`。
- report/task API 当前是全局列表；report summary 有 `competitorId`，task 只有 `targetId`，可通过 target join 过滤。
- 当前页面仍把 competitors、targets、reports、tasks、drafts、startupRuns 放在全局状态中，切换竞品时有混淆风险。

## 已确认技术方案

- 采用 `先 split-view，预留路由`。
- 本次仍使用 `/intelligence` 单路由，左侧或上层为竞品列表，右侧或下层为选中竞品详情。
- 状态、组件命名和数据加载边界按未来 `/intelligence/competitors/:id` 子路由设计，后续可以低成本迁移。
- 报告和任务过滤采用最小后端 query 参数：
  - `GET /intelligence/reports/inbox?competitorId=...`
  - `GET /intelligence/tasks?competitorId=...`
- 前端仍可保留本地 target join 作为容错，但主路径使用后端按竞品过滤。
- 跨竞品入口只保留 `全部情报` 作为二级入口；不保留全局 `全部任务`。
- 任务记录只在竞品详情内展示，避免把用户重新带回技术运维表格。
- 竞品详情内部采用 `竖向总览 + 分区`：
  - 顶部显示竞品状态、下一步动作、基线/报告状态。
  - 下方依次展示 `待确认监控页`、`已监控目标`、`情报报告`、`采集任务`。
  - 不在详情内部再套一层 tabs。

## 待确认问题

- 无。用户已确认设计方案。

## 测试策略

- 前端 build/type check。
- 浏览器验证：添加竞品 -> 进入详情 -> 发现待确认监控页 -> 开始采集 -> 显示首次基线。
- 浏览器验证：两个竞品切换时，目标、任务、报告、草稿不串。
- 使用 `/Users/kongdecheng/workspace/nova/doc/competitive-intelligence-target-sites.yaml` 中一个样例站点做首次采集冒烟。

## Spec Patch

- 无。当前 OpenSpec spec 已覆盖本次主流程；本次不新增深链路由要求。
