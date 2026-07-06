# Nova Web

Nova Web is the web frontend for the Nova AI assistant experience. It provides a Vue-based chat interface for conversations, sessions, files, model selection, and user authentication flows.

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
