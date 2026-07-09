# 用户画像驱动竞品研报前端工作台 实现计划（SSOT）

> **必需技能：** `spec-execute`（按批次执行本计划）
> **上下文获取：** 必须先执行 `spec-context` 获取上下文，定位 `{FEATURE_DIR}`，失败即停止

**目标：** 在 `/intelligence` 工作台内交付我方用户画像编辑、单竞品手动生成画像研报、生成状态、历史与 Markdown 在线研报详情。  
**范围：** In：画像表单 + Markdown 补充、版本信息、手动生成、历史/详情、XMarkdown/Markdown 报告阅读体验；Out：自动生成、上传解析、回滚、导出、分享、聊天主入口。  
**架构：** 在现有 `src/pages/intelligence/index.vue` 和 `src/api/intelligence` 内增量扩展，优先复用已安装的 `vue-element-plus-x` `XMarkdown` 作为 Markdown 报告组件；新增状态按 selected competitor 隔离，避免污染既有目标/任务/普通报告状态。  
**验收口径：** 追溯 `requirements/solution.md#8-mini-prd` 的 AC-UPR-FE-001 到 AC-UPR-FE-008，以及 `design/design.md#6-风险与验证清单` 的 R1-R5。  
**影响范围：** `web-client` 新增页面区块、API 类型与 Markdown 报告组件使用；`competitive-intelligence` 新增消费入口；`chat-agui` 不作为主路径。  
**需遵守的不变量：** `/intelligence` 仍为工作台入口；API wrapper 仍在 `src/api/intelligence`；`pnpm build` 必须通过；切换竞品不得泄漏上一竞品状态；既有工作台核心路径不回归。  
**子仓范围：** 无。

---

## TL;DR

- 前端在现有竞品情报页增量增加画像管理和画像研报，不新建研报中心。
- Markdown 报告组件首选现有 `vue-element-plus-x` 的 `XMarkdown`，先做兼容验证，失败再降级到现有 Markdown 样式容器。
- 最大风险是大页面状态串线和报告阅读层级不清，任务中用状态隔离和 smoke 验证压住。

---

## 范围与边界（In / Out）

- **In**：
  - 用户画像入口和表单：目标用户、核心场景、关键痛点、购买/使用动机、决策因素、反对理由、产品定位、重点关注指标。
  - Markdown 补充说明编辑区。
  - 当前生效状态、更新时间和版本信息展示。
  - 选择单个竞品手动生成画像研报。
  - 生成中、成功、失败状态展示。
  - 画像研报历史和在线详情。
  - 研报详情包含摘要、关键洞察、画像影响、证据、建议动作、元信息和 Markdown 正文。
- **Out**：
  - 竞品变化后自动生成画像研报。
  - 文件上传与自动解析。
  - 版本回滚、差异对比和恢复旧版。
  - PDF/Word/打印优化/分享链接。
  - 聊天/AgentScope 首版主入口。
- **不变量/关键约束**：
  - 新能力留在 `/intelligence` 工作台。
  - 前端 API 类型和 wrapper 落在 `src/api/intelligence`。
  - 既有 reports/entities/tasks、竞品详情抽屉、任务对比抽屉路径不回归。
  - 画像研报状态随竞品上下文刷新和重置。
- **影响面**：
  - `src/pages/intelligence/index.vue`
  - `src/api/intelligence/index.ts`
  - `src/api/intelligence/types.ts`
  - `src/styles/markdown.scss` 或页面局部样式
  - `package.json` / `pnpm-lock.yaml`（仅当 XMarkdown 无法满足时）

## 代码工作区清单（如适用）

无 `.gitmodules` 子仓。

---

## 影响范围与约束

- **受影响模块清单**（来源：`requirements/solution.md#7-impact-analysis`）：
  - `web-client`：新增页面区块、API 类型、Markdown 报告组件使用。
  - `competitive-intelligence`：新增画像管理和画像研报消费入口。
  - `chat-agui`：不作为首版主路径，无直接实现变更。
- **API/Data 契约不变量**：
  - `/intelligence` 静态路由仍挂载竞品情报工作台。
  - API wrapper 与 DTO 继续落在 `src/api/intelligence`。
  - API unwrap 继续兼容 `data` 和 `rows`。
  - `pnpm build` 必须通过 `vue-tsc -b` 与 Vite build。
  - 切换竞品时不得泄漏上一个竞品的 targets/tasks/reports；画像研报状态同样按 competitor 上下文隔离。
- **跨模块协调事项**：
  - 后端需提供当前画像、保存画像、生成画像研报、研报历史、研报详情接口。
  - Markdown 正文由报告组件渲染；结构化字段用于摘要、证据、画像影响和建议动作区块。
  - 画像版本策略要求当前画像和研报详情展示版本号、版本时间或等价信息。

---

## 里程碑与节奏

- M0（组件兼容性验证）：验证 `XMarkdown` 可在 intelligence 页面渲染报告正文并通过 build。
- M1（API 契约）：新增画像与画像研报 TypeScript 类型和 API wrapper。
- M2（画像管理 UI）：画像入口、表单、Markdown 补充说明、保存状态和版本信息。
- M3（生成与研报详情）：手动生成入口、生成状态、历史、详情与 Markdown 正文。
- M4（回归验证）：`pnpm build` 与竞品情报 smoke 路径通过。

---

## 依赖与资源

- 环境/权限：Node 22.16.0、pnpm、后端 `http://127.0.0.1:6039`。
- 外部系统/团队：依赖后端新增 `/intelligence/**` 画像与研报接口。
- 数据/样本：需要 1 份画像样例、1 个竞品、1 份 Markdown 研报样例。
- 发布/变更窗口：如需新增依赖，需锁定 lockfile 并验证构建体积/样式。

---

## 风险与验证（可执行）

| # | 风险/假设 | 验证方式 | 成功信号 | 失败信号 | Owner | 截止 | 下一步动作 |
|---|---|---|---|---|---|---|---|
| R1 | `XMarkdown` 兼容报告详情场景 | 最小引入到 intelligence 页面或临时局部组件，运行 `pnpm build` | build 通过，标题/表格/引用/代码块可渲染 | 构建失败或样式冲突严重 | DEV-FE | T1 结束 | 降级为现有 Markdown 样式容器，或再评估新增依赖 |
| R2 | 研报详情信息层级可读 | 用完整样例走查桌面和移动视口 | 首屏可见摘要、竞品、画像版本、关键结论 | 长文淹没关键信息 | DEV-FE | T4 结束 | 摘要/证据/建议动作改成独立区块 |
| R3 | 大页面状态不串线 | 切换竞品、打开详情、生成研报、返回任务/报告路径 | 上一竞品画像研报状态不残留 | 报告/任务/画像研报互相污染 | DEV-FE | T4 结束 | 拆 composable 或局部 state |
| R4 | 画像表单录入负担可接受 | 空画像、部分字段、完整画像三态走查 | 一个视图可完成核心字段与 Markdown 补充 | 字段含义不清或频繁跳转 | PM + DEV-FE | T3 后 | 重组字段分组或减少必填项 |
| R5 | 前端 ADR 索引缺口不隐藏依赖治理风险 | 执行前检查 `.aisdlc/project/adr/`；若新增依赖则记录选型说明 | 不新增依赖，或新增依赖有说明/ADR | 新增依赖无治理记录 | DEV-FE | T1 前 | 补建 ADR 或改用现有 XMarkdown |

---

## 验收口径（可追溯）

- 追溯：`requirements/solution.md#8-mini-prd`
  - AC-UPR-FE-001：用户能编辑结构化字段和 Markdown 补充说明。
  - AC-UPR-FE-002：保存后展示当前生效状态、更新时间和版本信息。
  - AC-UPR-FE-003：用户能选择单个竞品并手动触发画像研报生成。
  - AC-UPR-FE-004：画像研报生成过程有 loading、success、error 状态。
  - AC-UPR-FE-005：画像研报历史可查看，并能打开详情。
  - AC-UPR-FE-006：研报详情排版美观，包含摘要、洞察、画像影响、证据、建议动作和元信息。
  - AC-UPR-FE-007：首版不出现导出、分享、打印优化、回滚、文件上传入口。
  - AC-UPR-FE-008：新功能不破坏既有工作台核心路径。
- 追溯：`design/design.md#4-与现有系统的对齐`
  - `/intelligence` 静态路由、`src/api/intelligence` DTO、API unwrap、路由守卫和竞品上下文隔离不变量。

---

## NEEDS CLARIFICATION（未消除前不得进入 I2）

- 无产品或技术阻断项。
- 前端 ADR 索引缺口已转为 T1 前置验证：
  - 缺什么：`nova-web/.aisdlc/project/adr/index.md` 缺失，无法完成前端 ADR 全量核对。
  - 取证/验证方式：执行 T1 时检查是否需要新增依赖；首选复用已安装 `vue-element-plus-x` `XMarkdown`，若不新增依赖则记录“无需 ADR”；若新增依赖则补建 ADR 或依赖选型说明。
  - 成功/失败信号：成功信号为未新增依赖且 `pnpm build` 通过，或新增依赖已有 ADR/说明；失败信号为新增依赖但没有治理记录。
  - 下一步动作：T1 未完成前不得进入 T2-T4 实现。

---

## 任务清单（SSOT）

> 这是唯一的执行清单与状态来源：用 `- [ ] / - [x]` 标记完成；执行中把按 repo 记录的 `branch/commit/pr/changed_files` 与关键验证结果回写到对应任务。
> 命令默认面向 PowerShell；同一行多命令请用 `;` 分隔（不要用 `&&`）。

### Task T1: Markdown 组件与 ADR 缺口前置验证

- [x] **状态**：完成

**代码仓范围：**
- 根项目：`nova-web`
- 子仓：无

**文件：**
- 创建：无
- 修改：
  - `.aisdlc/specs/003-user-profile-research-report/implementation/plan.md`
  - `package.json`（仅当决定新增依赖）
  - `pnpm-lock.yaml`（仅当决定新增依赖）
- 测试：无新增测试文件

**验收点：**
- 确认首选使用 `vue-element-plus-x` 的 `XMarkdown`，或明确新增依赖并补齐依赖治理说明。
- `pnpm build` 至少在组件验证后可运行到明确结果。

**步骤 1：验证现有 Markdown 组件**
- Run: `pnpm build`
- Expected: PASS，当前基线可构建；如当前基线失败，记录失败点再继续局部组件验证。
- Result: PASS，基线 `pnpm build` 通过；仅有既有 KaTeX 字体、`:deep` 和 chunk size warning。

**步骤 2：写最少实现**
- 修改点：如需局部验证，在 `src/pages/intelligence/index.vue` 临时/最小引入 `XMarkdown` 渲染样例报告；验证后保留为后续 T4 基础或回退。

**步骤 3：运行验证**
- Run: `pnpm build`
- Expected: PASS，`XMarkdown` 类型和样式兼容；若 FAIL，记录失败并决定是否新增依赖或降级。
- Result: PASS，工程已安装并注册 `vue-element-plus-x`，聊天页现有 `XMarkdown` 用法可复用；本批不新增依赖、不修改 `package.json` 和 `pnpm-lock.yaml`。

**步骤 4：提交（频繁提交；commit message 必须中文）**
- Commit message: `验证画像研报 Markdown 组件方案`
- 审计信息：
  - repo: `root`
    branch: `003-user-profile-research-report`
    commit: `402c7b9`
    pr: `<执行后回填>`
    changed_files:
      - `.aisdlc/specs/003-user-profile-research-report/implementation/plan.md`
      - `src/pages/intelligence/index.vue`
      - `package.json`
      - `pnpm-lock.yaml`

### Task T2: 前端 API 类型与 wrapper

- [x] **状态**：完成

**代码仓范围：**
- 根项目：`nova-web`
- 子仓：无

**文件：**
- 创建：无
- 修改：
  - `src/api/intelligence/types.ts`
  - `src/api/intelligence/index.ts`
- 测试：无新增测试文件；以 `pnpm build` 做类型验证

**验收点：**
- 增加用户画像 request/vo、画像版本摘要、画像研报生成 request、历史 summary、详情 vo。
- API wrapper 覆盖当前画像、保存画像、生成研报、历史、详情。
- 延续 `unwrap` 对 `data`/`rows` 的兼容。

**步骤 1：写失败测试（类型验证）**
- Run: `pnpm build`
- Expected: FAIL，在页面引用新 API 前会出现类型/导出缺失信号。

**步骤 2：写最少实现**
- 修改点：`src/api/intelligence/types.ts`、`src/api/intelligence/index.ts`。

**步骤 3：运行验证**
- Run: `pnpm build`
- Expected: PASS 或仅剩页面未接入导致的预期失败；API 类型本身无 TS 错误。
- Result: PASS，执行 `pnpm build`，`vue-tsc -b && vite build` 通过；仅有既有 KaTeX 字体、`:deep` 和 chunk size warning。

**步骤 4：提交（频繁提交；commit message 必须中文）**
- Commit message: `新增用户画像研报前端 API 契约`
- 审计信息：
  - repo: `root`
    branch: `003-user-profile-research-report`
    commit: `7ec1db5`
    pr: `<执行后回填>`
    changed_files:
      - `src/api/intelligence/types.ts`
      - `src/api/intelligence/index.ts`

### Task T3: 用户画像管理 UI

- [ ] **状态**：未开始

**代码仓范围：**
- 根项目：`nova-web`
- 子仓：无

**文件：**
- 创建：无，除非执行时拆出局部组件
- 修改：
  - `src/pages/intelligence/index.vue`
- 测试：无新增测试文件；以 `pnpm build` 与手动 smoke 验证

**验收点：**
- `/intelligence` 内出现我方用户画像入口。
- 表单覆盖 8 个轻量结构化字段和 Markdown 补充说明。
- 保存后显示当前生效状态、更新时间和版本信息。
- 保存失败保留输入并显示错误。

**步骤 1：写失败测试（类型/模板验证）**
- Run: `pnpm build`
- Expected: FAIL，引用 T2 API 后若 UI 未完成会出现缺失 state/function 信号。

**步骤 2：写最少实现**
- 修改点：`src/pages/intelligence/index.vue` 中的 state、load/save 方法、表单区块和样式。

**步骤 3：运行验证**
- Run: `pnpm build`
- Expected: PASS，画像表单相关类型和模板编译通过。

**步骤 4：提交（频繁提交；commit message 必须中文）**
- Commit message: `实现竞品情报用户画像管理界面`
- 审计信息：
  - repo: `root`
    branch: `003-user-profile-research-report`
    commit: `<执行后回填>`
    pr: `<执行后回填>`
    changed_files:
      - `src/pages/intelligence/index.vue`

### Task T4: 手动生成、历史列表与 Markdown 研报详情

- [ ] **状态**：未开始

**代码仓范围：**
- 根项目：`nova-web`
- 子仓：无

**文件：**
- 创建：无，除非执行时拆出局部组件
- 修改:
  - `src/pages/intelligence/index.vue`
  - `src/styles/markdown.scss`（仅当需要全局报告 Markdown 样式调整）
- 测试：无新增测试文件；以 `pnpm build` 与浏览器 smoke 验证

**验收点：**
- 用户能在单个竞品上下文触发画像研报生成。
- 生成中、成功、失败状态明确。
- 历史列表可打开详情。
- 详情包含摘要、关键洞察、画像影响、证据、建议动作、元信息和 Markdown 正文。
- 不出现导出/分享/打印/回滚/文件上传入口。

**步骤 1：写失败测试（类型/模板验证）**
- Run: `pnpm build`
- Expected: FAIL，若 API 或 state 未完整接入，会出现缺失导入/属性信号。

**步骤 2：写最少实现**
- 修改点：生成入口、历史列表、详情区块、`XMarkdown` 渲染、竞品切换时清理局部状态。

**步骤 3：运行验证**
- Run: `pnpm build`
- Expected: PASS，页面模板与类型通过。

**步骤 4：提交（频繁提交；commit message 必须中文）**
- Commit message: `实现画像研报生成和详情展示`
- 审计信息：
  - repo: `root`
    branch: `003-user-profile-research-report`
    commit: `<执行后回填>`
    pr: `<执行后回填>`
    changed_files:
      - `src/pages/intelligence/index.vue`
      - `src/styles/markdown.scss`

### Task T5: 前端构建与竞品情报 smoke 验证

- [ ] **状态**：未开始

**代码仓范围：**
- 根项目：`nova-web`
- 子仓：无

**文件：**
- 修改：
  - `.aisdlc/specs/003-user-profile-research-report/implementation/plan.md`
- 测试：无新增测试文件

**验收点：**
- `pnpm build` 通过。
- 浏览器 smoke 仅针对 cwd 属于当前 worktree 的服务执行。
- 既有竞品列表、详情抽屉、监控目标、采集历史、任务记录、普通报告路径不回归。
- 新增画像、生成、历史、详情路径可走通或明确记录后端未就绪阻塞。

**步骤 1：运行构建**
- Run: `pnpm build`
- Expected: PASS。现有 KaTeX 字体、`:deep`、大 chunk 等 warning 不算失败。

**步骤 2：确认运行服务 cwd**
- Run: `lsof -iTCP -sTCP:LISTEN -n -P | rg "(java|node|6039|5173|5174)"`
- Expected: 找到服务后用 `lsof -a -p <pid> -d cwd -Fn` 确认 cwd 属于当前分支/工作区；否则不做 browser smoke。

**步骤 3：浏览器 smoke**
- Run: 手动或浏览器工具打开 `/intelligence`
- Expected: 既有路径不回归；新增画像研报路径按后端就绪程度验证。

**步骤 4：提交（频繁提交；commit message 必须中文）**
- Commit message: `验证画像研报前端工作台`
- 审计信息：
  - repo: `root`
    branch: `003-user-profile-research-report`
    commit: `<执行后回填>`
    pr: `<执行后回填>`
    changed_files:
      - `.aisdlc/specs/003-user-profile-research-report/implementation/plan.md`

---

## Merge-back 待办清单（仅记录，不在本阶段执行）

- MB-001：实现完成后将新增画像研报前端入口、API 类型与 Markdown 渲染口径晋升到 `project/components/web-client.md` 与 `project/products/competitive-intelligence-workbench.md`。
- MB-002：如果最终新增第三方 Markdown 依赖，补建或同步前端 ADR/依赖选型说明。
