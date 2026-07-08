---
module: platform-system
priority: P1
change_frequency: medium
last_verified_at: 2026-07-07
source_files:
  - nova-backend/nova-admin/src/main/resources/application.yml
  - nova-backend/nova-admin/src/main/resources/application-local.yml
  - nova-backend/nova-modules/nova-system/src/main/java/org/ruoyi/system/controller/system/SysUserController.java
  - nova-backend/nova-modules/nova-system/src/main/resources/mapper/system/SysUserMapper.xml
---

# 平台系统能力（platform-system）

## TL;DR
平台系统能力承载 RuoYi/Nova 的认证、租户、用户、角色、菜单、字典、参数、OSS、日志和监控基础能力。它是 chat、knowledge、workflow、intelligence 的基础依赖。关键配置入口在 `application.yml` 与 `application-local.yml`。

## 模块定位
- In：认证配置、租户插件、系统管理 API、监控 API、MyBatis mapper、资源配置。
- Out：AI 聊天、竞品情报、RAG、工作流的业务语义。

## Owner
- 团队/负责人/值班入口：RuoYi/Nova；值班入口见 ../ops/index.md。

## 入口
- 代码入口：`nova-backend/nova-modules/nova-system/`、`nova-backend/nova-admin/`
- 运行入口：../ops/index.md

## 协作场景（1–2 个）
- 业务模块通过 Sa-Token、TenantEntity、MyBatis-Plus 与系统配置继承认证、租户和数据访问能力。
- 前端登录态和后端安全排除路径共同决定访问控制边界。

## State Machines & Domain Events
- 状态机摘要：用户登录、token、租户、逻辑删除与在线用户管理由系统模块承载。
- 领域事件摘要：未识别独立事件总线入口，系统日志通过数据库与日志配置落地。

## API Contract
- 权威入口（必须可定位）：`nova-backend/nova-modules/nova-system/src/main/java/org/ruoyi/system/controller/`
- 不变量摘要（3–7 条）：
  - 系统 API 以 `/system/**`、`/monitor/**`、`/resource/**` 等路径暴露。
  - 权限注解使用 Sa-Token。
  - 菜单路由入口为 `/system/menu/getRouters`。
  - API 文档由 springdoc 配置扫描系统模块。
- 证据入口（最小粒度）：`SysUserController.java`、`SysMenuController.java`、`CacheController.java`、`application.yml`

## Data Contract
- 数据主责（Ownership）：主写 `sys_*`、monitor/log、OSS 配置等平台表。
- 核心对象与主键：用户、角色、菜单、部门、岗位、字典、租户、客户端、OSS、操作日志。
- 权威入口（必须可定位）：`nova-backend/docs/script/sql/ruoyi-ai-v3_mysql8.sql`、`nova-backend/nova-modules/nova-system/src/main/resources/mapper/system/`
- 不变量摘要（3–7 条）：
  - MyBatis-Plus mapper 包扫描为 `org.ruoyi.**.mapper`。
  - 全局逻辑删除已启用。
  - 默认主键策略为 ASSIGN_ID。
  - 多租户默认启用，并在配置中列出排除表。
- 证据入口（最小粒度）：`application.yml`、`Sys*Mapper.xml`、`Sys*` domain/service/controller

## Evidence（证据入口）
- Code：`nova-backend/nova-modules/nova-system/`、`nova-backend/nova-admin/`
- Tests：`cd nova-backend && mvn -pl nova-modules/nova-system test`
- CI：`cd nova-backend && mvn test`
- Ops：../ops/index.md

## Evidence Gaps（缺口清单）
- 缺口：平台系统缺少局部测试清单与认证/租户回归用例入口。
  - 期望补齐到的粒度：登录、权限、租户隔离、菜单路由的自动化测试文件。
  - 候选证据位置：`nova-backend/nova-modules/nova-system/src/test/`、外部测试平台。
  - 影响：P1 模块暂不允许在组件索引中打勾。
