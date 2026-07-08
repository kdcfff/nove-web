---
module: competitive-intelligence
priority: P0
change_frequency: high
last_verified_at: 2026-07-07
source_files:
  - nova-backend/nova-modules/nova-intelligence/src/main/java/org/ruoyi/intelligence/controller/IntelligenceController.java
  - nova-backend/nova-modules/nova-intelligence/src/main/java/org/ruoyi/intelligence/service/IntelligenceService.java
  - nova-backend/docs/script/sql/update/updat-0425.sql
  - nova-web/src/api/intelligence/index.ts
  - nova-web/src/pages/intelligence/index.vue
---

# 竞品情报（competitive-intelligence）

## TL;DR
竞品情报模块提供我方画像、竞品、监控目标、采集任务、变化报告、反馈与知识库写回入口。后端权威入口是 `IntelligenceController` 与 `IntelligenceService`，前端权威入口是 `/intelligence` 页面和 `src/api/intelligence`。持久化主责在 `intel_*` 表，增量 DDL 为 `updat-0425.sql`。采集工具同时提供 Firecrawl、Nova rendered、A/B 与偏好查询接口。

## 模块定位
- In：竞品资料、目标推荐、目标采集、快照差异、报告收件箱、报告反馈、知识写回状态。
- Out：外部情报源调度平台、完整知识库写入内容生成、竞品策略决策审批。

## Owner
- 团队/负责人/值班入口：Nova；值班入口见 ../ops/index.md。

## 入口
- 代码入口：`nova-backend/nova-modules/nova-intelligence/`
- 前端入口：`nova-web/src/pages/intelligence/index.vue`
- 路由入口：`nova-web/src/routers/modules/staticRouter.ts`
- 运行入口：../ops/index.md

## 协作场景（1–2 个）
- 前端 `/intelligence` 通过 `nova-web/src/api/intelligence/index.ts` 调用后端 `/intelligence/**`，显示实体、报告、任务与详情抽屉。
- `triggerCollect` 调用采集编排器，保存 raw capture 与 snapshot，计算 changes，并为低噪声变化生成 report。

## State Machines & Domain Events
- 状态机摘要：监控目标状态来自 `active/draft/paused`；采集任务状态来自 `queued/running/success/failed`；报告写回状态来自 `none/written/failed`。
- 领域事件摘要：当前以同步方法和数据库写入表达状态变化，没有独立 event bus 入口。

## API Contract
- 权威入口（必须可定位）：`nova-backend/nova-modules/nova-intelligence/src/main/java/org/ruoyi/intelligence/controller/IntelligenceController.java`、`nova-backend/docs/openapi/capture-webpage-firecrawl.openapi.yaml`、`nova-backend/docs/openapi/capture-webpage-nova-rendered.openapi.yaml`
- 不变量摘要（3–7 条）：
  - HTTP API 根路径固定为 `/intelligence`。
  - API 响应统一包裹为 `R<T>`。
  - 前端 unwrap 兼容 `data` 与 `rows` 两种响应承载。
  - 采集工具接口保留 Firecrawl、Nova rendered、A/B、偏好查询四类入口。
  - 创建监控目标时会规范化 URL，并可执行可达性校验。
  - 采集失败时任务状态为 `failed`，成功采集后更新目标 `lastCollectedAt`。
  - 变化噪声风险达到阈值时只记录 change，不晋升 report。
- 证据入口（最小粒度）：`IntelligenceController.java`、`IntelligenceService.java`、`nova-web/src/api/intelligence/types.ts`、`nova-backend/nova-modules/nova-intelligence/src/test/java/org/ruoyi/intelligence/service/capture/`

## Data Contract
- 数据主责（Ownership）：模块主写 `intel_*` 情报表；读取竞品、目标、任务、报告并向前端投影 VO。
- 核心对象与主键：company profile、competitor、monitor target、task run、raw capture、snapshot、change、report、feedback 均以 `id` 为主键。
- 权威入口（必须可定位）：`nova-backend/docs/script/sql/update/updat-0425.sql`、`nova-backend/nova-modules/nova-intelligence/src/main/java/org/ruoyi/intelligence/domain/entity/`
- 不变量摘要（3–7 条）：
  - 所有情报表保留 `tenant_id` 与 `del_flag`。
  - 竞品到监控目标、任务、采集、快照、变化、报告通过 `competitor_id` 或 `target_id` 串联。
  - 原始采集保留请求 URL、最终 URL、markdown、链接、按钮、质量分与降级信息。
  - 快照保存页面身份、内容块、语义信号、链接、CTA 与 hash JSON。
  - report 只保存摘要、影响、建议动作、证据、反馈与知识写回状态，不保存完整采集正文。
  - 删除竞品会级联删除目标、目标产物与相关报告。
- 证据入口（最小粒度）：`updat-0425.sql`、`Intel*` entity、`Intel*Mapper`、`IntelligenceService.storeRawCapture`、`IntelligenceService.storeSnapshot`

## Evidence（证据入口）
- Code：`nova-backend/nova-modules/nova-intelligence/`、`nova-web/src/api/intelligence/`、`nova-web/src/pages/intelligence/index.vue`
- Tests：`nova-backend/nova-modules/nova-intelligence/src/test/java/org/ruoyi/intelligence/service/capture/`
- CI：`cd nova-backend && mvn -pl nova-modules/nova-intelligence test`
- Ops：../ops/index.md

## Evidence Gaps（缺口清单）
- None identified for P0 Discover DoD from current repository evidence.
