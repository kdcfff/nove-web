# 竞品情报前端工作台

## 原始来源
- OpenSpec change: `openspec/changes/competitive-intelligence-workbench`
- OpenSpec change: `openspec/changes/competitor-drilldown-intelligence-workbench`
- 相关归档：`archive/2026-07-07-make-intelligence-workbench-usable-flow`、`archive/2026-07-07-add-manual-intelligence-targets`

## 交付目标
把竞品情报能力做成以竞品为中心的前端工作台：用户先选择竞品，再管理监控页、采集、baseline、任务、变化报告与反馈动作。

## 范围 In
- 新增/完善 `/intelligence` 路由和侧边栏入口。
- 建立竞品列表、竞品详情抽屉、监控目标、采集历史、报告详情、反馈与知识写回 UI。
- 支持手动添加监控目标、验证后加入监控、触发采集，并展示 baseline/no-report 状态。
- 保留全局任务记录作为跨竞品排障视图。
- 提供前端 API 类型、构建验证与浏览器 smoke 路径。

## 范围 Out
- 不新增外部通知。
- 不重建后端采集/差异/报告架构。
- 不把全局任务页作为主操作入口。

## 初始验收口径
- AC-WB-001: 用户能从 `/intelligence` 进入竞品列表并打开竞品详情。
- AC-WB-002: 竞品详情展示已监控目标、target URL、调度/采集状态与操作。
- AC-WB-003: 用户能添加或确认监控页并触发采集。
- AC-WB-004: 采集历史显示触发来源、状态、开始/完成时间、对比和报告动作。
- AC-WB-005: 前端 build 通过，浏览器 smoke 可复现核心路径。
