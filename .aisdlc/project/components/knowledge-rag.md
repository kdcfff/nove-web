---
module: knowledge-rag
priority: P1
change_frequency: medium
last_verified_at: 2026-07-07
source_files:
  - nova-backend/nova-modules/nova-chat/src/main/java/org/ruoyi/controller/knowledge/KnowledgeInfoController.java
  - nova-backend/nova-modules/nova-chat/src/main/java/org/ruoyi/controller/knowledge/KnowledgeFragmentController.java
  - nova-backend/nova-modules/nova-chat/src/main/java/org/ruoyi/service/retrieval/impl/KnowledgeRetrievalServiceImpl.java
  - nova-backend/nova-modules/nova-chat/src/main/java/org/ruoyi/service/vector/impl/VectorStoreServiceImpl.java
---

# 知识库与 RAG（knowledge-rag）

## TL;DR
知识库模块位于 `nova-chat` 内，提供知识库信息、附件、分片、检索、向量存储与文档解析能力。聊天模块通过知识检索服务把 RAG 结果纳入上下文。向量数据库实现包含 Milvus、Qdrant、Weaviate。

## 模块定位
- In：知识库 CRUD、附件上传解析、fragment 检索、向量写入与查询、文档 loader/splitter。
- Out：聊天模型调用、竞品报告正文生成、外部对象存储治理。

## Owner
- 团队/负责人/值班入口：RuoYi/Nova；值班入口见 ../ops/index.md。

## 入口
- 代码入口：`nova-backend/nova-modules/nova-chat/src/main/java/org/ruoyi/controller/knowledge/`
- 运行入口：../ops/index.md

## 协作场景（1–2 个）
- 聊天请求携带知识库 id 时，ChatServiceFacade 可构造检索上下文。
- 竞品报告提供 knowledge writeback 状态，但当前代码只标记状态，未识别真实写入知识库正文的实现入口。

## State Machines & Domain Events
- 状态机摘要：附件解析状态由 `KnowledgeAttachStatus` 表达；向量存储策略由 factory 决定。
- 领域事件摘要：未识别独立 event bus 入口。

## API Contract
- 权威入口（必须可定位）：`KnowledgeInfoController.java`、`KnowledgeAttachController.java`、`KnowledgeFragmentController.java`
- 不变量摘要（3–7 条）：
  - 知识库管理 API 使用 `/system/info`、`/system/attach`、`/system/fragment`。
  - 上传入口位于 `KnowledgeAttachController`。
  - fragment retrieval 暴露为 `/system/fragment/retrieval`。
  - 权限注解使用 `system:*` permission key。
- 证据入口（最小粒度）：controller、service、retriever、vector strategy 文件。

## Data Contract
- 数据主责（Ownership）：主写 knowledge info、attach、fragment、graph instance、graph segment 等实体。
- 核心对象与主键：KnowledgeInfo、KnowledgeAttach、KnowledgeFragment、KnowledgeGraphInstance、KnowledgeGraphSegment。
- 权威入口（必须可定位）：`nova-backend/nova-modules/nova-chat/src/main/java/org/ruoyi/domain/entity/knowledge/`、`nova-backend/docs/script/sql/ruoyi-ai-v3_mysql8.sql`
- 不变量摘要（3–7 条）：
  - 文档内容经 loader 和 splitter 转为 fragment。
  - 向量存储通过策略类屏蔽 Milvus/Qdrant/Weaviate 差异。
  - 检索结果以 VO 返回给调用方。
- 证据入口（最小粒度）：entity、mapper、service、vector strategy 文件。

## Evidence（证据入口）
- Code：`nova-backend/nova-modules/nova-chat/src/main/java/org/ruoyi/service/knowledge/`、`nova-backend/nova-modules/nova-chat/src/main/java/org/ruoyi/service/retrieval/`
- Tests：`nova-backend/nova-modules/nova-chat/src/test/java/`
- CI：`cd nova-backend && mvn -pl nova-modules/nova-chat test`
- Ops：../ops/index.md

## Evidence Gaps（缺口清单）
- 缺口：知识库表结构没有独立增量 SQL 入口，需从基线 SQL 或实体反查。
  - 期望补齐到的粒度：知识库相关表的迁移文件或模块级 schema 入口。
  - 候选证据位置：`nova-backend/docs/script/sql/ruoyi-ai-v3_mysql8.sql`、历史迁移平台。
  - 影响：P1 数据契约维护成本较高。
