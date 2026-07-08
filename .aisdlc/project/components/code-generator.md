---
module: code-generator
priority: P1
change_frequency: low
last_verified_at: 2026-07-07
source_files:
  - nova-backend/nova-modules/nova-generator/src/main/java/org/ruoyi/generator/controller/GenController.java
  - nova-backend/nova-modules/nova-generator/src/main/resources/generator.yml
  - nova-backend/nova-modules/nova-generator/src/main/resources/vm/
  - nova-backend/nova-modules/nova-generator/src/main/resources/mapper/generator/GenTableMapper.xml
---

# 代码生成器（code-generator）

## TL;DR
代码生成器是 RuoYi 风格的数据库表导入、预览、生成与下载模块。模板覆盖 Java、Mapper XML、SQL、TS API、Vben views 等输出。它依赖数据库元数据和 generator mapper。

## 模块定位
- In：数据库表导入、生成配置、模板渲染、代码下载。
- Out：业务模块运行时逻辑、前端页面接入后的产品行为。

## Owner
- 团队/负责人/值班入口：RuoYi/Nova；值班入口见 ../ops/index.md。

## 入口
- 代码入口：`nova-backend/nova-modules/nova-generator/`
- 运行入口：../ops/index.md

## 协作场景（1–2 个）
- 管理端通过 `/tool/gen/**` 导入数据表并生成后端/前端代码骨架。
- 生成模板读取 generator 配置和表列元数据，输出多语言文件。

## State Machines & Domain Events
- 状态机摘要：导入、配置、预览、生成、下载由 controller 方法驱动。
- 领域事件摘要：未识别独立事件入口。

## API Contract
- 权威入口（必须可定位）：`GenController.java`
- 不变量摘要（3–7 条）：
  - API 根路径为 `/tool/gen`。
  - 权限 key 使用 `tool:gen:*`。
  - 支持列表、数据库表列表、导入、编辑、删除、预览、下载等入口。
- 证据入口（最小粒度）：`GenController.java`、`IGenTableService.java`、`GenTableServiceImpl.java`

## Data Contract
- 数据主责（Ownership）：主写 generator 表和列配置；读取目标业务数据库表元数据。
- 核心对象与主键：GenTable、GenTableColumn。
- 权威入口（必须可定位）：`GenTable.java`、`GenTableColumn.java`、`GenTableMapper.xml`、`GenTableColumnMapper.xml`
- 不变量摘要（3–7 条）：
  - 模板根目录在 `src/main/resources/vm/`。
  - 支持多数据库 SQL 模板。
  - 生成参数来自 generator 配置与表列配置。
- 证据入口（最小粒度）：domain、mapper、vm、generator.yml。

## Evidence（证据入口）
- Code：`nova-backend/nova-modules/nova-generator/`
- Tests：`cd nova-backend && mvn -pl nova-modules/nova-generator test`
- CI：`cd nova-backend && mvn test`
- Ops：../ops/index.md

## Evidence Gaps（缺口清单）
- 缺口：未定位到 generator 模块专属测试入口。
  - 期望补齐到的粒度：模板渲染、导入表、预览和下载的回归测试文件。
  - 候选证据位置：`nova-backend/nova-modules/nova-generator/src/test/`。
  - 影响：P1 模块暂不允许在组件索引中打勾。
