# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Design System Protocol

Before changing frontend UI, layout, component structure, or styles, read `DESIGN.md` first, then inspect the relevant local page/component implementation. `DESIGN.md` is the durable design-system source of truth for Nova Web and follows the google-labs-code/design.md idea: machine-readable tokens plus human-readable design rationale.

For substantial UI changes, use VoltAgent/awesome-design-md as a reference library for product design patterns, but translate references into Nova's own operational workbench language instead of copying another product's brand identity.

If `DESIGN.md` conflicts with established local component behavior, preserve the local behavior needed for the product flow and update the design guidance only when making a deliberate, durable design decision.

## Project Overview

This is **ruoyi-web**, a Vue 3 AI chat application built with TypeScript, Vite, and Element Plus. It provides a chat interface for AI interactions with support for sessions, models, and various authentication methods.

## Commands

```bash
# Development
pnpm dev          # Start dev server

# Build
pnpm build        # Type-check and build for production

# Linting
pnpm lint         # Run ESLint
pnpm lint:stylelint  # Run Stylelint
pnpm fix          # Auto-fix ESLint issues

# Preview production build
pnpm preview
```

## Architecture

### Tech Stack
- **Vue 3** with Composition API (`<script setup>`)
- **TypeScript** for type safety
- **Pinia** for state management with persistence (`pinia-plugin-persistedstate`)
- **Vue Router** for routing with navigation guards
- **Element Plus** for UI components
- **UnoCSS** for atomic CSS
- **hook-fetch** for HTTP requests with SSE support

### Directory Structure

```
src/
├── api/           # API modules (auth, chat, model, session) with types
├── assets/        # Static assets (SVG icons organized by category)
├── components/    # Reusable components (LoginDialog, ModelSelect, etc.)
├── config/        # App configuration constants
├── constants/     # Enum definitions
├── hooks/         # Custom Vue composables
├── layouts/       # Layout components (LayoutVertical, LayoutMobile)
├── pages/         # Page components (chat, error pages)
├── routers/       # Route definitions and guards
├── stores/        # Pinia stores (user, chat, session, model, design)
├── styles/        # Global SCSS styles and variables
├── utils/         # Utilities (request wrapper, markdown renderers)
└── main.ts        # App entry point
```

### Key Patterns

**API Layer** (`src/api/`):
- Each module has `index.ts` for API calls and `types.ts` for TypeScript interfaces
- Uses `hook-fetch` with JWT plugin for authentication
- Base URL configured via `VITE_API_URL` environment variable

**State Management** (`src/stores/`):
- Stores use Composition API style with `defineStore`
- User store persists token and userInfo
- Session store handles chat sessions with pagination
- Chat store manages messages and deep thinking state

**Routing** (`src/routers/`):
- Static routes defined in `modules/staticRouter.ts`
- Route guard checks token and handles auth redirect
- White list routes bypass auth check

**HTTP Requests** (`src/utils/request.ts`):
- Auto-injects `Bearer` token and `ClientID` headers
- Handles 401 (logout) and 403 (redirect) responses
- Supports SSE streaming via `sseTextDecoderPlugin`

### Environment Variables

Configure in `.env.development`:
- `VITE_API_URL` - Backend API base URL
- `VITE_CLIENT_ID` - Client identifier for auth
- `VITE_WEB_TITLE` - Page title

### Code Style

- ESLint with `@antfu/eslint-config`
- Vue blocks order: script → template → style
- Single quotes, semicolons, 2-space indent
- Commit messages follow conventional commits with commitlint

## Competitive Intelligence Protocol

Before changing competitive intelligence frontend behavior, read the product requirements and backend capture design:

- `/Users/kongdecheng/workspace/nova/doc/竞品情报能力迁移方案.md`
- `/Users/kongdecheng/workspace/nova/nova-backend/docs/superpowers/specs/2026-07-06-competitive-intelligence-capture-design.md`
- `/Users/kongdecheng/workspace/nova/nova-backend/docs/openapi/capture-webpage-firecrawl.openapi.yaml`
- `/Users/kongdecheng/workspace/nova/nova-backend/docs/openapi/capture-webpage-nova-rendered.openapi.yaml`

Frontend intelligence views should expose evidence and old/new change details before AI interpretation, so users can see why a report matters.

## Competitive Intelligence Verification

When validating competitive-intelligence frontend changes:

```bash
pnpm build
```

Existing warnings about KaTeX fonts, deprecated `:deep` combinator usage, or large chunks are warnings unless the build exits non-zero.

Only run browser smoke against a frontend process whose cwd is this branch or worktree:

```bash
lsof -iTCP:5173 -sTCP:LISTEN -n -P
lsof -iTCP:5174 -sTCP:LISTEN -n -P
lsof -a -p <pid> -d cwd -Fn
```

For competitive intelligence UI smoke, verify:

- Open the intelligence workbench.
- Open a competitor with `查看详情`.
- In the detail Drawer, confirm `已监控目标` shows target URL, schedule state, next run time, last scheduled time/result, and actions.
- Open `定时`, save off/daily/weekly/cron as relevant, and confirm the target row refreshes.
- Trigger target collection or competitor `一键采集`, then confirm `采集历史` shows trigger source, status, start/finish time, compare action, and report action when `reportId` exists.
- Confirm global `任务记录` still works as a cross-competitor troubleshooting view and shows trigger source.
