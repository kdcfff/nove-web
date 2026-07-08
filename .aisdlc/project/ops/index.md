# Ops Index（入口页）

## 运行入口
- 本地启动：../memory/structure.md#入口可执行证据
- 后端配置：`nova-backend/nova-admin/src/main/resources/application.yml`、`nova-backend/nova-admin/src/main/resources/application-local.yml`
- 前端配置：`nova-web/.env.development`、`nova-web/vite.config.mts`
- Docker：`nova-backend/docs/docker/nova-ai/`、`nova-web/docker-compose.yml`

## 可观测入口
- Dashboard：`spring.boot.admin.client` 配置入口见 `nova-backend/nova-admin/src/main/resources/application-local.yml`
- Alerts：见 Evidence Gaps
- Logs：`logs/nova-backend-main.log`、`logs/nova-web-main.log`、`nova-backend/nova-admin/src/main/resources/logback-plus.xml`

## 回滚入口
- Rollback：见 Evidence Gaps

## Runbook
- 本地进程识别、启动、重启命令：`AGENTS.md`
- 后端打包命令：`cd nova-backend && mvn -pl nova-admin -am package -DskipTests`
- 前端构建命令：`cd nova-web && pnpm build`

## Delta Discover / stale
- 触发条件：P0/P1 模块 `source_files` 变更、增量 SQL 变更、前端 API DTO 变更、README 启动入口变更。
- 最小更新范围：受影响模块页、`components/index.md` 的导航状态、相关 product 页入口摘要。
- 模块新鲜度：以模块页 `last_verified_at` 为准。

## Evidence Gaps（缺口清单）
- 缺口：未定位到生产监控 dashboard、告警规则与日志查询平台链接。
  - 期望补齐到的粒度：dashboard URL、alert rule 名、日志查询入口。
  - 候选证据位置：外部监控平台、部署平台、团队 runbook。
  - 影响：事故排查只能从本地日志和 Spring Boot Admin 配置入口开始。
- 缺口：未定位到生产发布与回滚流水线。
  - 期望补齐到的粒度：部署 job、rollback job、镜像 tag 策略。
  - 候选证据位置：`*/.github/workflows/`、Vercel/Railway/容器平台、外部 CI。
  - 影响：上线方案和回滚方案需要在需求实现前重新确认。
