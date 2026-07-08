# AI Assistant Workbench

## TL;DR
面向用户的 AI 助手工作台，覆盖聊天、深度思考、只读数据库工具、知识检索与工作流入口。

## Capability Catalog
| capability | summary | evidence |
|---|---|---|
| CAP-001 Chat SSE | 用户消息通过 `/chat/send` 流式返回。 | ../components/chat-agui.md |
| CAP-002 AgentScope Tools | 思考模式下可使用受限只读数据库工具。 | ../components/chat-agui.md |
| CAP-003 Knowledge Retrieval | 聊天链路可接入知识库检索上下文。 | ../components/knowledge-rag.md |
| CAP-004 Workflow Chat | 聊天请求可进入 workflow 或 resume 模式。 | ../components/workflow-aiflow.md |

## Business Rules Index
| rule | summary | evidence |
|---|---|---|
| BR-001 Thinking Route | `enableThinking=true` 进入 AgentScope runtime。 | ../components/chat-agui.md |
| BR-002 Readonly Tooling | 数据库工具只允许只读 SQL。 | ../components/chat-agui.md |

## Domain Events
| event | meaning | evidence |
|---|---|---|
| AG-UI event | AgentScope runtime 的流式运行事件。 | ../components/chat-agui.md |
