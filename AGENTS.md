# AGENTS.md

This file provides guidance to Codex when working in this repository.

## Design System Protocol

Before changing frontend UI, layout, component structure, or styles, read `DESIGN.md` first, then inspect the relevant local page/component implementation.

`DESIGN.md` is Nova Web's durable design-system source of truth. It follows the google-labs-code/design.md idea: machine-readable design tokens in YAML front matter plus human-readable rationale in Markdown.

If `DESIGN.md` conflicts with established local component behavior, preserve the behavior needed for the product flow and update the design guidance only when making a deliberate, durable design decision.

## Project Notes

- This is a Vue 3, TypeScript, Vite, Element Plus, SCSS, and UnoCSS application.
- Prefer existing Element Plus and local component patterns before introducing new primitives.
- Keep workbench/admin screens dense, calm, scannable, and task-oriented.
