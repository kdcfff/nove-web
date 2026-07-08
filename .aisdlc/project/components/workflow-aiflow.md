---
module: workflow-aiflow
priority: P1
change_frequency: medium
last_verified_at: 2026-07-07
source_files:
  - nova-backend/nova-modules/nova-aiflow/src/main/java/org/ruoyi/workflow/controller/WorkflowRuntimeController.java
  - nova-backend/nova-modules/nova-aiflow/src/main/java/org/ruoyi/workflow/workflow/WorkflowStarter.java
  - nova-backend/nova-modules/nova-workflow/src/main/java/org/ruoyi/workflow/controller/FlwTaskController.java
  - nova-backend/nova-modules/nova-workflow/src/main/resources/mapper/workflow/FlwTaskMapper.xml
---

# 工作流与 AI Flow（workflow-aiflow）

## TL;DR
工作流能力由两个后端模块组成：`nova-aiflow` 承载 AI 节点编排与运行，`nova-workflow` 承载 Warm Flow 审批/任务能力。聊天入口在 workflow 模式或 resume 模式下会委托 `IWorkFlowStarterService`。

## 模块定位
- In：AI workflow 设计、节点/边/运行态、人工反馈、Warm Flow 定义、实例、任务、分类。
- Out：聊天模型供应商实现、前端流程设计器页面。

## Owner
- 团队/负责人/值班入口：RuoYi/Nova；值班入口见 ../ops/index.md。

## 入口
- 代码入口：`nova-backend/nova-modules/nova-aiflow/`、`nova-backend/nova-modules/nova-workflow/`
- 运行入口：../ops/index.md

## 协作场景（1–2 个）
- ChatServiceFacade 在 `enableWorkFlow` 或 `isResume` 时调用工作流启动/恢复能力。
- AI Flow 节点包括 LLM answer、HTTP request、human feedback、knowledge retrieval、mail send 等。

## State Machines & Domain Events
- 状态机摘要：AI Flow 由 graph、node、edge、runtime、runtime node 表达；Warm Flow 由 definition、instance、task 表达。
- 领域事件摘要：Warm Flow 有全局 listener 与 process event handler；AI Flow 通过 runtime 和 SSE helper 表达运行反馈。

## API Contract
- 权威入口（必须可定位）：`nova-aiflow/src/main/java/org/ruoyi/workflow/controller/`、`nova-workflow/src/main/java/org/ruoyi/workflow/controller/`
- 不变量摘要（3–7 条）：
  - AI Flow runtime 由 runtime controller/service/starter 进入。
  - 人机交互恢复参数通过 ChatServiceFacade 传递到 workflow starter。
  - Warm Flow controller 暴露 category、definition、instance、task、spel 等管理入口。
- 证据入口（最小粒度）：controller、WorkflowStarter、WorkflowEngine、Flw* service 文件。

## Data Contract
- 数据主责（Ownership）：AI Flow 主写 workflow、node、edge、runtime、runtime node；Warm Flow 主写 flow definition/instance/task 扩展表。
- 核心对象与主键：Workflow、WorkflowNode、WorkflowEdge、WorkflowRuntime、FlowInstance、FlowTask。
- 权威入口（必须可定位）：`nova-aiflow/src/main/java/org/ruoyi/workflow/entity/`、`nova-workflow/src/main/resources/mapper/workflow/`
- 不变量摘要（3–7 条）：
  - AI Flow 节点输入配置有 TypeHandler。
  - Warm Flow mapper 位于 `mapper/workflow/`。
  - 流程运行数据与节点运行数据分离。
- 证据入口（最小粒度）：entity、mapper、service、workflow engine 文件。

## Evidence（证据入口）
- Code：`nova-backend/nova-modules/nova-aiflow/`、`nova-backend/nova-modules/nova-workflow/`
- Tests：`cd nova-backend && mvn -pl nova-modules/nova-aiflow,nova-modules/nova-workflow test`
- CI：`cd nova-backend && mvn test`
- Ops：../ops/index.md

## Evidence Gaps（缺口清单）
- 缺口：未定位到 workflow 模块专属测试或迁移文件入口。
  - 期望补齐到的粒度：流程创建、运行、恢复、任务流转的测试文件与 schema 迁移。
  - 候选证据位置：`nova-backend/nova-modules/nova-aiflow/src/test/`、`nova-backend/docs/script/sql/`。
  - 影响：P1 模块暂不允许在组件索引中打勾。
