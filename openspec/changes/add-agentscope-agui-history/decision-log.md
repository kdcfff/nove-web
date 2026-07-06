# Decision Log

- Backend change is `add-agentscope-agui-runtime`.
- Frontend receives persisted events through `/system/message/list`, not a second request.
- Tool cards are bound to the assistant message that produced them.
- Live streaming and historical replay use the same message-scoped render path.
- Historical replay is static final-state restoration, not animated event playback.
- Existing AG-UI adapter and `ToolCallCard` are reused.
- Normal chat without `agentEvents` remains unchanged.
