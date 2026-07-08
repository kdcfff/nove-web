# 业务边界（稳定语义）

## In / Out
- In：Nova AI 助手聊天、AgentScope AG-UI 工具事件、知识库/RAG、工作流编排、竞品情报工作台、RuoYi 系统管理能力。
- Out：`nova-copilot`、`nova-chatbot`、`nova-portal` 当前作为同工作区候选/参考子仓；本次 Discover 的主链路证据来自 `nova-backend` 与 `nova-web`。

## 业务地图入口
- ../products/index.md

## AI-SDLC Spec Traceability（2026-07-09 merge-back）

| Spec Pack | repo | branch | capability | project entry | verification status |
|---|---|---|---|---|---|
| 001-competitive-intelligence-mvp | nova-backend | `001-competitive-intelligence-mvp` | 竞品情报后端 MVP、采集、报告、反馈质量与 AI 分析 | ../components/competitive-intelligence.md | intelligence 模块测试已通过；admin package/smoke 待最终确认 |
| 001-competitive-intelligence-workbench | nova-web | `001-competitive-intelligence-workbench` | 竞品列表优先的工作台、监控目标、采集历史、调度和报告入口 | ../products/competitive-intelligence-workbench.md | 前端 build/smoke 待最终确认 |
| 002-agentscope-agui | nova-backend | `002-agentscope-agui` | AgentScope thinking runtime、AG-UI SSE、事件持久化、只读工具治理 | ../components/chat-agui.md | chat 模块测试待最终确认 |
| 002-agentscope-agui | nova-web | `002-agentscope-agui` | message-scoped AG-UI 工具卡和历史静态回放 | ../components/chat-agui.md | 前端 build/smoke 待最终确认 |

## 术语入口
- ./glossary.md

## Evidence Gaps（缺口清单）
- 缺口：产品 PRD 与当前代码实现之间没有统一追踪矩阵。
  - 期望补齐到的粒度：业务能力到前端页面、后端接口、数据库对象、测试入口的映射。
  - 候选证据位置：`doc/产品PRD共仓库/`、`nova-backend/openspec/`、`nova-web/openspec/`。
  - 影响：需求变更容易复读 Discover，且可能误判 MVP 边界。
