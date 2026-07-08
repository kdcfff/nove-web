# 技术栈与工程护栏

## 技术栈（稳定选择）
- 后端：Java 17、Spring Boot 3.5.8、Maven multi-module，入口见 `nova-backend/pom.xml` 与 `nova-backend/nova-admin/pom.xml`。
- AI 编排：Langchain4j、AgentScope Java、LangGraph4j，版本入口见 `nova-backend/pom.xml`。
- 数据库/缓存：MySQL、Redis、MyBatis-Plus、多租户插件，入口见 `nova-backend/nova-admin/src/main/resources/application.yml`。
- 前端：Vue 3、TypeScript、Vite、Element Plus、Pinia、UnoCSS，入口见 `nova-web/package.json`。
- 采集/情报：Nova rendered capture、Firecrawl adapter、OpenAPI tool spec，入口见 `nova-backend/docs/openapi/`。

## 质量门禁入口（可执行证据）
- 后端测试：`cd nova-backend && mvn test`
- 后端局部测试：`cd nova-backend && mvn -pl nova-modules/nova-intelligence test`
- 后端打包：`cd nova-backend && mvn -pl nova-admin -am package -DskipTests`
- 前端检查：`cd nova-web && pnpm lint`
- 前端构建：`cd nova-web && pnpm build`

## NFR 入口
- 认证/租户/接口安全：`nova-backend/nova-admin/src/main/resources/application.yml`
- 本地资源与外部依赖：`nova-backend/nova-admin/src/main/resources/application-local.yml`
- SSE 与实时事件：`nova-backend/nova-common/nova-common-sse/`、`nova-backend/nova-modules/nova-chat/src/main/java/org/ruoyi/observability/`
- 日志配置：`nova-backend/nova-admin/src/main/resources/logback-plus.xml`

## Evidence Gaps（缺口清单）
- 缺口：没有项目级 SLO、容量、成本或安全审计文档入口。
  - 期望补齐到的粒度：按服务列出 SLO、错误预算、关键告警、容量基线。
  - 候选证据位置：外部监控平台、部署平台、`docs/`、运维 runbook。
  - 影响：性能和可用性需求阶段需要重新确认非功能目标。
