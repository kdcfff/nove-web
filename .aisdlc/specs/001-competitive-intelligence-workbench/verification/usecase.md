# 竞品情报前端工作台测试用例

| Case | AC | Steps | Expected |
|---|---|---|---|
| TC-WB-001 | AC-WB-001 | 打开 `/intelligence`，点击 `查看详情` | 详情打开并加载当前竞品数据 |
| TC-WB-002 | AC-WB-002 | 查看 `已监控目标` | URL、状态、next/last run、操作可见 |
| TC-WB-003 | AC-WB-003 | 添加/确认目标并触发采集 | 任务刷新且目标保持 scoped |
| TC-WB-004 | AC-WB-004 | 查看采集历史 | trigger source、status、时间、对比/报告动作可见 |
| TC-WB-005 | AC-WB-005 | 运行 `pnpm build` | 构建通过 |
