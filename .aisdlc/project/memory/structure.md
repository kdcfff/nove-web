# 结构与入口（北极星）

## 项目形态
- 工作区根目录不是 Git 仓库，主线由多个子仓组成：`nova-backend/`、`nova-web/`、`nova-chatbot/`、`nova-copilot/`、`nova-portal/`。
- 当前 Nova 主链路证据集中在 `nova-backend/README.md`、`nova-web/README.md`、`AGENTS.md`。

## 入口（可执行证据）
- 后端本地启动：`AGENTS.md`、`nova-backend/nova-admin/src/main/resources/application-local.yml`、`nova-backend/pom.xml`
- 前端本地启动：`AGENTS.md`、`nova-web/package.json`、`nova-web/.env.development`
- 后端构建/测试：`nova-backend/pom.xml`、`nova-backend/nova-modules/nova-chat/src/test/java/`、`nova-backend/nova-modules/nova-intelligence/src/test/java/`
- 前端构建/检查：`nova-web/package.json`
- DB 结构入口：`nova-backend/docs/script/sql/ruoyi-ai-v3_mysql8.sql`、`nova-backend/docs/script/sql/update/`
- OpenAPI 入口：`nova-backend/docs/openapi/`
- Docker 入口：`nova-backend/docs/docker/nova-ai/`、`nova-web/docker-compose.yml`

## 代码地图
- 组件地图：../components/index.md
- 业务地图：../products/index.md
- Ops 入口：../ops/index.md

## Evidence Gaps（缺口清单）
- 缺口：根工作区没有统一 CI/CD workflow 入口。
  - 期望补齐到的粒度：定位到每个子仓的 build/test/deploy job 名。
  - 候选证据位置：`*/.github/workflows/`、部署平台配置、外部流水线。
  - 影响：Discover 只能引用本地命令作为验证入口，无法证明合并门禁。
