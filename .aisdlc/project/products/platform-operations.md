# Platform Operations

## TL;DR
承载认证、租户、系统管理、代码生成、运行配置和基础运维入口的后台平台能力。

## Capability Catalog
| capability | summary | evidence |
|---|---|---|
| CAP-001 Identity & Tenant | Sa-Token 与租户插件提供基础隔离。 | ../components/platform-system.md |
| CAP-002 Admin Resources | 用户、角色、菜单、字典、OSS 等后台资源。 | ../components/platform-system.md |
| CAP-003 Code Generation | 基于数据库表生成后端/前端骨架。 | ../components/code-generator.md |

## Business Rules Index
| rule | summary | evidence |
|---|---|---|
| BR-001 Logic Delete | 全局逻辑删除由 MyBatis-Plus 配置控制。 | ../components/platform-system.md |
| BR-002 Tenant Excludes | 平台配置显式排除部分共享表。 | ../components/platform-system.md |

## Domain Events
| event | meaning | evidence |
|---|---|---|
| System Operation Log | 管理操作与登录信息由系统/监控模块承载。 | ../components/platform-system.md |
