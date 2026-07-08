---
module: chat-agui
priority: P0
change_frequency: high
last_verified_at: 2026-07-07
source_files:
  - nova-backend/nova-modules/nova-chat/src/main/java/org/ruoyi/controller/chat/ChatController.java
  - nova-backend/nova-modules/nova-chat/src/main/java/org/ruoyi/service/chat/impl/ChatServiceFacade.java
  - nova-backend/nova-modules/nova-chat/src/main/java/org/ruoyi/service/chat/impl/AgentScopeChatRuntime.java
  - nova-backend/docs/script/sql/update/updat-0424.sql
  - nova-web/src/pages/chat/layouts/chatWithId/aguiAdapter.ts
---

# 聊天与 AG-UI（chat-agui）

## TL;DR
聊天入口固定为 `/chat/send`，普通聊天走原 provider 链路，`enableThinking=true` 时路由到 AgentScope runtime。AgentScope 运行产生 AG-UI 事件并通过 SSE `event: agui` 推给前端，同时持久化到 `agent_run_event`。前端在实时流与历史回放中都把 AG-UI events 折叠为工具调用卡片。

## 模块定位
- In：聊天 SSE、模型路由、思考模式、AgentScope 只读数据库工具、AG-UI 事件持久化与回放。
- Out：模型供应商后台配置、完整工作流定义、知识库内容管理。

## Owner
- 团队/负责人/值班入口：Nova；值班入口见 ../ops/index.md。

## 入口
- 代码入口：`nova-backend/nova-modules/nova-chat/`
- 前端入口：`nova-web/src/pages/chat/`
- 运行入口：../ops/index.md

## 协作场景（1–2 个）
- 前端发送 `SendDTO` 到 `/chat/send`，后端保存用户消息、连接 SSE、加载模型配置，并按特殊模式或 provider 路由。
- AgentScope direct mode 直接执行一个选中的只读数据库工具，发送 `TOOL_CALL_*` 与 `TEXT_MESSAGE_CONTENT` 事件并保存助手消息。

## State Machines & Domain Events
- 状态机摘要：聊天模式按 workflow、resume、thinking、provider 四类优先级路由；toolMode 规范化为 `auto/disabled/selected/direct`。
- 领域事件摘要：AG-UI 事件以 `RUN_*`、`TEXT_MESSAGE_*`、`TOOL_CALL_*`、`RUN_ERROR` 形式流式发送并按 sequence 持久化。

## API Contract
- 权威入口（必须可定位）：`ChatController.sseChat`、`ChatServiceFacade.sseChat`、`AgentScopeChatRuntime.stream`、`nova-web/src/api/chat/types.ts`
- 不变量摘要（3–7 条）：
  - `/chat/send` 返回 `SseEmitter`。
  - 后端在发起模型或 AgentScope 前保存用户消息。
  - `enableThinking=true` 时进入 AgentScope runtime，不走普通 provider streaming。
  - toolMode 空值或非法值规范化为 `auto`。
  - `direct` 模式必须且只能选择一个工具。
  - 可注册的 AgentScope 数据库工具固定为 `query_all_tables`、`query_table_schema`、`execute_readonly_sql`。
  - AG-UI 运行结束或失败后都会完成当前 SSE 连接。
- 证据入口（最小粒度）：`ChatController.java`、`ChatServiceFacade.java`、`AgentScopeChatRuntime.java`、`AgentScopeDatabaseTools.java`、`nova-web/src/components/ChatSender/index.vue`

## Data Contract
- 数据主责（Ownership）：模块主写聊天消息与 `agent_run_event`；读取模型配置、会话上下文与知识库入口。
- 核心对象与主键：`agent_run_event.id` 自增主键；`agent_run_id + sequence_no` 表达一次运行内顺序；`message_id` 在助手消息保存后回连。
- 权威入口（必须可定位）：`nova-backend/docs/script/sql/update/updat-0424.sql`、`AgentRunEvent.java`、`AgentRunEventMapper.java`、`AgentRunEventServiceImpl.java`
- 不变量摘要（3–7 条）：
  - 每个 AG-UI 事件保留完整 JSON payload。
  - 事件可按 session、message、run sequence、tool call 建索引查询。
  - `execute_readonly_sql` 只允许 SELECT、SHOW、DESC、DESCRIBE、EXPLAIN 且拒绝多语句。
  - 助手文本非空时才保存为 assistant message。
  - 保存助手消息后按 run id 回填 `message_id`。
  - 前端历史消息可携带 `agentEvents` 并折叠为静态工具卡片。
- 证据入口（最小粒度）：`updat-0424.sql`、`AgentRunEvent.java`、`AgentRunEventServiceImpl.java`、`nova-web/src/stores/modules/chat.ts`

## Evidence（证据入口）
- Code：`nova-backend/nova-modules/nova-chat/src/main/java/org/ruoyi/service/chat/impl/AgentScopeChatRuntime.java`、`nova-web/src/pages/chat/layouts/chatWithId/aguiAdapter.ts`
- Tests：`nova-backend/nova-modules/nova-chat/src/test/java/`
- CI：`cd nova-backend && mvn -pl nova-modules/nova-chat test`
- Ops：../ops/index.md

## AI-SDLC Traceability

| branch | repo | AC scope | plan/report |
|---|---|---|---|
| `002-agentscope-agui` | nova-backend | AgentScope runtime、AG-UI 事件持久化、只读工具、安全错误路径 | `nova-backend/.worktrees/aidlc-agentscope-agui/.aisdlc/specs/002-agentscope-agui/` |
| `002-agentscope-agui` | nova-web | `agentEvents` 历史回放、message-scoped tool cards、普通聊天兼容 | `nova-web/.worktrees/aidlc-agentscope-agui/.aisdlc/specs/002-agentscope-agui/` |

## Evidence Gaps（缺口清单）
- None identified for P0 Discover DoD from current repository evidence.
