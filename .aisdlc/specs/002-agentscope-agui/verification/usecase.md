# AgentScope AG-UI 前端历史回放测试用例

| Case | AC | Steps | Expected |
|---|---|---|---|
| TC-AGW-001 | AC-AGW-001 | 打开有 agentEvents 的历史 session | 对应 assistant message 下显示工具卡 |
| TC-AGW-002 | AC-AGW-002 | 发起 live AgentScope 工具调用 | 当前回复下实时出现/更新工具卡 |
| TC-AGW-003 | AC-AGW-003 | 打开普通聊天 session | 无工具卡错误，文本正常 |
| TC-AGW-004 | AC-AGW-004 | 运行 `pnpm build` | 构建通过 |
