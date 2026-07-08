---
module: web-client
priority: P0
change_frequency: high
last_verified_at: 2026-07-07
source_files:
  - nova-web/package.json
  - nova-web/vite.config.mts
  - nova-web/.env.development
  - nova-web/src/routers/modules/staticRouter.ts
  - nova-web/src/api/index.ts
---

# Web 客户端（web-client）

## TL;DR
`nova-web` 是主 Nova 前端，使用 Vue 3、Vite、Element Plus、Pinia 与 UnoCSS。静态路由包含聊天首页、指定会话聊天和竞品情报页。API 通过 `/dev-api` 代理概念与 `VITE_API_URL` 指向后端 `http://127.0.0.1:6039`。

## 模块定位
- In：聊天 UI、AG-UI 工具卡、模型/会话/文件选择、登录态、竞品情报工作台、前端路由与 API wrapper。
- Out：后端业务状态机、数据库迁移、模型供应商配置。

## Owner
- 团队/负责人/值班入口：Nova；值班入口见 ../ops/index.md。

## 入口
- 代码入口：`nova-web/src/`
- 运行入口：../ops/index.md

## 协作场景（1–2 个）
- 聊天页面通过 `src/api/chat` 调用 `/chat/send`，并在 `chatWithId` 布局中处理普通 SSE 与 AG-UI 事件。
- 竞品情报页面通过 `src/api/intelligence` 调用 `/intelligence/**`，维护实体、任务、报告和详情视图。

## State Machines & Domain Events
- 状态机摘要：路由守卫基于白名单与 token；聊天发送器维护 thinking/toolMode/direct 参数；竞品页维护 reports/entities/tasks 三个视图。
- 领域事件摘要：前端消费后端 SSE 与 AG-UI event，不自建跨模块事件总线。

## API Contract
- 权威入口（必须可定位）：`nova-web/src/api/`、`nova-web/src/routers/modules/staticRouter.ts`、`nova-web/src/utils/request`
- 不变量摘要（3–7 条）：
  - `pnpm dev` 是本地 Vite 启动入口。
  - `pnpm build` 先运行 `vue-tsc -b` 再运行 `vite build`。
  - 开发环境 API 目标由 `.env.development` 的 `VITE_API_URL` 定义。
  - 路由根路径重定向到聊天首页，`/chat/:id` 复用聊天页。
  - `/intelligence` 静态路由挂载竞品情报页。
  - API wrapper 以 TypeScript DTO 作为前端契约入口。
- 证据入口（最小粒度）：`package.json`、`vite.config.mts`、`.env.development`、`staticRouter.ts`、`src/api/chat/types.ts`、`src/api/intelligence/types.ts`

## Data Contract
- 数据主责（Ownership）：前端不主写数据库；主责是 Pinia store、localStorage 参数、DTO 类型与 UI state。
- 核心对象与主键：聊天 session/message、AgentRunEventVo、CompetitorVo、MonitorTargetVo、ReportSummaryVo、TaskRunVo。
- 权威入口（必须可定位）：`nova-web/src/stores/modules/`、`nova-web/src/api/chat/types.ts`、`nova-web/src/api/intelligence/types.ts`
- 不变量摘要（3–7 条）：
  - AG-UI history 由后端返回的 `agentEvents` 还原工具卡片。
  - thinking 开关与工具模式参与下一次发送 payload。
  - 竞品情报 API unwrap 兼容 `data` 和 `rows`。
  - 用户 token 缺失时路由守卫触发 logout。
  - 前端 DTO 枚举约束 target type、task status、feedback value 与 report priority。
- 证据入口（最小粒度）：`src/stores/modules/chat.ts`、`src/stores/modules/user.ts`、`src/api/chat/types.ts`、`src/api/intelligence/types.ts`

## Evidence（证据入口）
- Code：`nova-web/src/`
- Tests：`pnpm lint`、`pnpm build`
- CI：`cd nova-web && pnpm build`
- Ops：../ops/index.md

## Evidence Gaps（缺口清单）
- None identified for P0 Discover DoD from current repository evidence.
