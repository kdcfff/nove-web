# AGENTS.md

This file provides guidance to Codex when working in this repository.

## Design System Protocol

Before changing frontend UI, layout, component structure, or styles, read `DESIGN.md` first, then inspect the relevant local page/component implementation.

`DESIGN.md` is Nova Web's durable design-system source of truth. It follows the google-labs-code/design.md idea: machine-readable design tokens in YAML front matter plus human-readable rationale in Markdown.

For substantial UI changes, use VoltAgent/awesome-design-md as a reference library for product design patterns, but translate references into Nova's own operational workbench language instead of copying another product's brand identity.

If `DESIGN.md` conflicts with established local component behavior, preserve the behavior needed for the product flow and update the design guidance only when making a deliberate, durable design decision.

## Project Notes

- This is a Vue 3, TypeScript, Vite, Element Plus, SCSS, and UnoCSS application.
- Prefer existing Element Plus and local component patterns before introducing new primitives.
- Keep workbench/admin screens dense, calm, scannable, and task-oriented.

## Competitive Intelligence Protocol

Before changing competitive intelligence frontend behavior, read the product requirements and backend capture design:

- `/Users/kongdecheng/workspace/nova/doc/竞品情报能力迁移方案.md`
- `/Users/kongdecheng/workspace/nova/nova-backend/docs/superpowers/specs/2026-07-06-competitive-intelligence-capture-design.md`
- `/Users/kongdecheng/workspace/nova/nova-backend/docs/openapi/capture-webpage-firecrawl.openapi.yaml`
- `/Users/kongdecheng/workspace/nova/nova-backend/docs/openapi/capture-webpage-nova-rendered.openapi.yaml`

Frontend intelligence views should expose evidence and old/new change details before AI interpretation, so users can see why a report matters.
