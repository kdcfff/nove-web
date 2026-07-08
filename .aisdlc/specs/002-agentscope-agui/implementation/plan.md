# AgentScope AG-UI 前端历史回放实现计划（SSOT）

> **必需技能：** `spec-execute`
> **上下文获取：** 必须先执行 `spec-context` 获取上下文，定位 `{FEATURE_DIR}`，失败即停止

**目标：** 让实时和历史聊天都能按 assistant message 展示 AG-UI 工具卡。  
**范围：** In: chat types/store/page/adapter；Out: 动画 replay 和 UI 重写。  
**架构：** backend `agentEvents` -> store mapping -> `foldAgentEventsToToolCalls` -> `MessageItem.toolCalls` -> `ToolCallCard`。  
**验收口径：** AC-AGW-001 至 AC-AGW-004。  
**影响范围：** `src/api/chat/types.ts`、`src/stores/modules/chat.ts`、`src/pages/chat/layouts/chatWithId/*`。  
**需遵守的不变量：** 普通聊天兼容、message-scoped、unsupported events safe ignore。  
**子仓范围：** 无。

---

## Traceability Matrix

| AC | Plan Task | Code Evidence | Test Evidence | Report |
|---|---|---|---|---|
| AC-AGW-001 | T1/T3 | `chat.ts`, `aguiAdapter.ts`, `index.vue` | history smoke | `verification/report-2026-07-08-v1.md` |
| AC-AGW-002 | T2 | `index.vue` live handler | live smoke | same |
| AC-AGW-003 | T4 | missing event guard | normal chat smoke | same |
| AC-AGW-004 | T5 | package scripts | `pnpm build` | same |

## 任务清单（SSOT）

### Task T1: 类型和折叠 helper

- [x] **状态**：完成

**文件：**
- `src/api/chat/types.ts`
- `src/pages/chat/layouts/chatWithId/aguiAdapter.ts`

**验收点：**
- `ChatMessageVo.agentEvents` 可选。
- `foldAgentEventsToToolCalls` 能处理 ordered events。

### Task T2: 实时 message-scoped tool cards

- [x] **状态**：完成

**文件：** `src/pages/chat/layouts/chatWithId/index.vue`

**验收点：**
- live tool updates 写入当前 assistant message。

### Task T3: 历史恢复

- [x] **状态**：完成

**文件：** `src/stores/modules/chat.ts`

**验收点：**
- `requestChatList` 把 `agentEvents` 映射为 `toolCalls`。

### Task T4: 兼容普通聊天

- [x] **状态**：完成

**验收点：**
- 无 `agentEvents` 时 toolCalls 为空数组。
- unsupported event 不影响渲染。

### Task T5: 构建和 smoke

- [ ] **状态**：待验证

**验证：**
- Run: `pnpm build`
- Browser: live AgentScope run -> reload session -> cards restored。

## NEEDS CLARIFICATION

- 无产品阻断问题。是否补单元测试取决于项目现有测试入口。
