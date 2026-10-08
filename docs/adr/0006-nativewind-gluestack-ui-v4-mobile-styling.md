# 0006. NativeWind + gluestack-ui v4 for mobile styling

Date: backfilled 2026-10-08 · Status: accepted

## Context

The mobile app needs a consistent, themeable, accessible component system across Android/iOS/tablet layouts, with the team already fluent in Tailwind from the web app.

## Decision

Style the mobile app with NativeWind 4 (Tailwind 3 syntax) and build UI on gluestack-ui v4 components, restricted to **semantic design tokens only** (e.g. `text-foreground`, `bg-primary`) — no generic/numbered Tailwind colors. The full set of enforced patterns lives in `.agents/skills/gluestack-ui-v4/SKILL.md` (plus `packages/agents` wrappers where library logic needs TypeScript).

## Consequences

- Tailwind stays on major version 3 in mobile (NativeWind compatibility) while web uses Tailwind 4 — an intentional split; upgrading mobile Tailwind is a NativeWind-driven decision, not a chore.
- One styling vocabulary across both apps lowers context-switching cost; semantic tokens keep dark mode and theming correct by construction.
- New mobile screens compose gluestack primitives instead of raw React Native ones; ad-hoc inline styles and raw color values are reworked on touch.
- Agents (and humans) must load the gluestack skill before styling work — the skill, not this ADR, is the pattern reference.
