# Brainstorm Summary

- Change: add-manual-intelligence-targets
- Date: 2026-07-07

## 确认的技术方案

采用方案 A：前端候选态 + 后端保存 `source` / `analysisNotes`。

手动表单先在竞品详情 Drawer 中创建 pending candidate，保存时调用现有 `createMonitorTarget` 后端接口验活。后端扩展 nullable `source` 和 `analysisNotes` 字段，验活成功后创建 active target，并在刷新后保留手动来源和用户关注点。采集、首次基线、diff、报告和任务记录继续走现有 target pipeline，不新增独立 custom-analysis pipeline。

## 当前已确认事实

- 用户已确认 OpenSpec 范围：在竞品详情中允许手动录入竞品监控目标，目标必须验活，成功后进入现有采集、基线、diff、报告链路。
- 前端已有竞品详情 Drawer、待确认监控页、已监控目标、一键采集、任务记录和报告列表。
- 前端已有 `DraftSource = homepage_link | feed_hint | rule_fallback | manual`，但推荐目标当前统一转为 `rule_fallback`，尚无手动录入表单。
- 后端 `POST /intelligence/targets` 已在 `createTarget` 中执行 URL/RSS 验活，并成功后创建 active 目标。
- 后端 `intel_monitor_target` 当前字段包含 competitorId/type/title/url/status/confidence/lastCollectedAt，尚无 `source` 或 `analysisNotes`。
- 当前报告生成是规则化报告，不是 LLM prompt 管道；`analysisNotes` 本期更适合存储并作为目标上下文/解释文本，不承诺完整 AI prompt 注入。
- 后端 active change `improve-intelligence-target-discovery-flow` 已规划 candidate provenance，包括 `source = manual`，本 change 应避免冲突，并优先使用兼容字段。

## 候选方案

### 方案 A：前端候选态 + 后端保存 source/analysisNotes（已确认）

手动表单先创建 pending candidate，保存时调用现有 `createMonitorTarget` 验活。后端扩展 nullable `source` 和 `analysisNotes` 字段，成功后 active target 可在刷新后保留手动来源和分析备注。

### 方案 B：前端候选态，不扩展后端字段

手动目标只在前端候选阶段标记为 manual，入库后与普通目标无差别。实现最小，但刷新后丢失来源和分析备注，不能支撑后续“自定义分析”。

### 方案 C：新增独立 target candidate 表

完整持久化候选、验活、失败原因和来源，最适合长期目标发现流。但它与 `improve-intelligence-target-discovery-flow` 高度重叠，超出本 change 的最小交付。

## 关键取舍与风险

- 推荐方案 A，原因是它满足用户自定义目标和后续分析上下文，又不新建独立候选系统。
- 风险：需要数据库字段扩展。缓解：字段 nullable，默认 `source = manual` 或 `rule_fallback`，不破坏现有目标。
- 风险：一些页面 collection 能抓到，但简单验活会失败。缓解：本 change 保持当前验活边界，失败可编辑；后续由 target discovery flow 统一升级验活策略。
- 风险：`analysisNotes` 被误读为证据。缓解：仅作为用户关注点/上下文展示和 reason 辅助，不作为 report evidence。

## 测试策略

- 后端：DTO/service 编译或 focused tests；验证 manual target 创建成功、无效 URL 失败、RSS 非 feed 失败。
- 前端：类型检查/build；验证 Drawer 手动添加、候选展示、保存验活、失败提示、刷新后 active target 信息。
- 冒烟：从目标站点列表选一个真实网页作为手动目标，完成 UI 激活和一次采集；再用明显无效 URL 验证失败不入库。

## Spec Patch

- 回写 delta spec：补充 `analysisNotes` 只作为用户关注点/上下文，不作为证据。
- 回写 delta spec：补充刷新后 manual provenance 应保留。
