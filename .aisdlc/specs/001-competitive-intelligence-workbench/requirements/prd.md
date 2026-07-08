# 竞品情报前端工作台 PRD

## Objective

让用户围绕某一个竞品完成监控页确认、采集、baseline 理解、报告查看、反馈和排障。

## Users

- 产品经理：查看竞品变化证据并反馈。
- 运营：添加监控页、触发采集、查看任务状态。
- 管理者：扫描报告优先级和建议动作。

## Scope

In: `/intelligence` 路由、竞品列表、详情抽屉、监控目标、采集历史、报告详情、反馈、知识写回、定时配置展示/保存。  
Out: 外部通知配置、后端采集重构、完整聊天写操作。

## Acceptance Criteria

| AC | Description | Testable Signal |
|---|---|---|
| AC-WB-001 | 进入 `/intelligence` 并打开竞品详情 | UI 可点击并加载 scoped data |
| AC-WB-002 | 详情展示已监控目标与状态 | 目标 URL、schedule、next/last run、actions 可见 |
| AC-WB-003 | 可确认/添加监控页并采集 | API 调用成功，task row 刷新 |
| AC-WB-004 | 采集历史可排障 | trigger source、status、time、compare/report 可见 |
| AC-WB-005 | 构建与 smoke 可复现 | build 通过，报告记录截图/路径 |

## Business Rules

- BR-WB-001: 竞品是主操作对象。
- BR-WB-002: 全局任务页是排障视图，不是主流程。
- BR-WB-003: 首采结果要说明 baseline，不强行要求 report。
- BR-WB-004: 用户可编辑/移除待确认监控页。

## Source

- OpenSpec: `openspec/changes/competitive-intelligence-workbench`
- OpenSpec: `openspec/changes/competitor-drilldown-intelligence-workbench`
