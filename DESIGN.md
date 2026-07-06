---
version: "0.1"
name: "Nova Web Design System"
description: "Operational AI workbench design guidance for Nova Web, adapted from google-labs-code/design.md and informed by VoltAgent/awesome-design-md references."
references:
  specification: "https://github.com/google-labs-code/design.md"
  inspiration_library: "https://github.com/VoltAgent/awesome-design-md"
stack:
  framework: "Vue 3"
  language: "TypeScript"
  ui: "Element Plus"
  styling:
    - "SCSS"
    - "UnoCSS"
colors:
  canvas: "#f6f7f9"
  surface: "#ffffff"
  surface-muted: "#f3f4f6"
  border: "#dcdfe6"
  text-primary: "#1f2329"
  text-secondary: "#606266"
  text-muted: "#909399"
  primary: "#2563eb"
  success: "#67c23a"
  warning: "#e6a23c"
  danger: "#f56c6c"
typography:
  page-title:
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "22px"
    fontWeight: 650
    lineHeight: "30px"
    letterSpacing: "0px"
  section-title:
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "16px"
    fontWeight: 650
    lineHeight: "24px"
    letterSpacing: "0px"
  body:
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "22px"
    letterSpacing: "0px"
  caption:
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "18px"
    letterSpacing: "0px"
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    height: "32px"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  data-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
---

## Overview

Nova Web is an AI workbench and admin-style product surface. Its default posture is calm, dense, scannable, and task-oriented. Build the usable workspace first: chat, competitive intelligence, evidence review, configuration, and operational feedback should feel immediate and dependable.

This file follows the spirit of google-labs-code/design.md: agents need both exact tokens and the reasoning behind them. It also uses VoltAgent/awesome-design-md as an inspiration library for studying how strong product design languages are documented. Before changing any frontend UI, layout, component structure, or style, read this file and inspect the local page/component being changed.

## Reference Library Workflow

Use google-labs-code/design.md as the format baseline and VoltAgent/awesome-design-md as a reference library. The Google project defines the durable structure for Nova's own design system. The VoltAgent collection is useful for comparing product moods, component conventions, and agent-facing prompt guidance.

When a frontend change is larger than a local polish pass, choose up to three relevant reference styles from VoltAgent/awesome-design-md and translate the useful patterns into Nova language. Do not copy another product's brand identity, palette, typography, or distinctive layout wholesale.

Good reference directions for Nova:

- Linear-like density for issue lists, status triage, and execution queues.
- Vercel-like restraint for developer/admin surfaces, settings, and deployment-style status.
- Cursor-like AI workbench clarity for chat, tools, context panels, and evidence review.
- Stripe-like form discipline for configuration, billing-like data entry, or multi-step setup.

The output of reference review should be a short design note in the implementation plan or PR summary: which references were considered, what pattern was borrowed, and what was intentionally kept Nova-specific.

## Colors

Use a neutral product palette with Element Plus semantic colors as the interaction language. The interface should not become a one-note color theme. Use the darker `primary` token when white text sits on a blue action surface.

- Use `surface`, `surface-muted`, `border`, and text tokens for most structure.
- Use `primary` for main actions and active navigation.
- Use `success`, `warning`, and `danger` only for status, priority, validation, or risk.
- Avoid decorative gradients, floating color blobs, and dark atmospheric backgrounds unless a specific product state requires them.

## Typography

Text should support repeated work. Prefer compact hierarchy over hero-scale type.

- Use `page-title` only for page-level titles.
- Use `section-title` inside panels, tables, drawers, dialogs, and sidebars.
- Use `body` and `caption` for operational copy, metadata, timestamps, and evidence snippets.
- Keep letter spacing at `0`. Do not scale font sizes with viewport width.

## Layout

Nova surfaces should be full-width work areas with constrained inner rhythm where needed.

- Prefer split panes, tables, lists, tabs, filters, drawers, and dialogs for workbench flows.
- Keep dashboards dense enough for scanning and comparison.
- Use stable dimensions for toolbars, counters, board cells, icon buttons, sidebars, and repeated cards so hover or loading states do not shift layout.
- On mobile, preserve the primary workflow with stacked panes, sticky actions, and readable controls.

## Elevation & Depth

Use depth sparingly. Panels may use borders and subtle shadows, but page sections should not become floating marketing cards.

- Prefer borders and background contrast before heavy shadows.
- Use modal and drawer elevation only when focus needs to move to a temporary task.
- Do not nest cards inside cards.

## Shapes

Default radius should stay at `8px` or below for product surfaces. Larger radii are reserved for existing global Element Plus overrides or focused modal surfaces that already use them.

Use familiar icons for compact tools. Prefer Element Plus icons already used in the project instead of custom SVGs for common commands.

## Components

Element Plus is the primary component library. Start with existing Element Plus components and local patterns before introducing new UI primitives.

- Use `ElButton`, `ElIcon`, `ElTag`, `ElTabs`, `ElTable`, `ElForm`, `ElInput`, `ElSelect`, `ElDialog`, `ElDrawer`, `ElAlert`, and `ElTooltip` for standard interactions.
- Use icon-only buttons for common tool actions when the icon is familiar, with tooltip or accessible label.
- Use tags for status and priority, segmented controls or tabs for mutually exclusive views, switches/checkboxes for binary settings, and sliders/number inputs for numeric settings.
- Keep copy inside buttons short. If text cannot fit cleanly on mobile, change layout before shrinking it into illegibility.

## Do's and Don'ts

Do:

- Read `DESIGN.md`, `CLAUDE.md`, `AGENTS.md` when present, and the relevant local implementation before frontend edits.
- For substantial UI changes, use VoltAgent/awesome-design-md as a reference library and state which references influenced the implementation.
- Match the existing Vue `<script setup>` and SCSS patterns.
- Make intelligence and chat flows feel like an operational console: fast to scan, easy to compare, explicit about status.
- Verify important UI changes in the browser at desktop and mobile widths.

Don't:

- Build landing-page heroes for app/workbench requests.
- Add decorative cards, nested cards, gradient blobs, or oversized headings to operational screens.
- Copy another company's brand system directly from a reference `DESIGN.md`.
- Introduce a new component library without a clear reason and explicit confirmation.
- Let dynamic text overlap controls or resize fixed-format UI.
