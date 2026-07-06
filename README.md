# Nova Web

Nova Web is the web frontend for the Nova AI assistant experience. It provides a Vue-based chat interface for conversations, sessions, files, model selection, and user authentication flows.

## AgentScope AG-UI Tool Events

Nova Web keeps normal chat rendering unchanged. When the backend streams AgentScope native AG-UI events through `/chat/send`, the chat page handles `event: agui` frames and renders tool-call cards under the assistant message that produced them.

The history path uses the same UI shape: `/system/message/list` may return assistant messages with `agentEvents`, and the frontend folds those persisted AG-UI events into static tool-call cards on page reload. History replay is intentionally not animated.

Supported event groups:

| AG-UI events | Frontend behavior |
| --- | --- |
| `TEXT_MESSAGE_CONTENT`, `TEXT_MESSAGE_CHUNK` | Append assistant markdown text |
| `REASONING_CONTENT`, `REASONING_MESSAGE_CONTENT` | Append thinking content |
| `TOOL_CALL_START`, `TOOL_CALL_ARGS`, `TOOL_CALL_CHUNK` | Show or update pending tool card |
| `TOOL_CALL_END`, `TOOL_CALL_RESULT`, `TOOL_RESULT` | Mark tool card as successful |
| `RUN_ERROR`, `ERROR` | Show error toast and an error card |
| `RUN_FINISHED` | End the stream |

## Tech Stack

- Vue 3
- TypeScript
- Vite
- Element Plus
- Pinia
- UnoCSS

## Local Development

```bash
pnpm install
pnpm dev
```

The development server starts with Vite. Check the terminal output for the local URL.

## Build

```bash
pnpm build
```

The build runs type checking with `vue-tsc` and then creates the production bundle with Vite.

## Preview

```bash
pnpm preview
```

## Docker

```bash
docker compose up -d --build
```

The standalone frontend service listens on port `5137` by default.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Type-check and build for production |
| `pnpm preview` | Preview the production build locally |
| `pnpm lint` | Run ESLint |
| `pnpm fix` | Run automatic lint fixes |

## License

This project is released under the MIT License. See [license](license) for details.
