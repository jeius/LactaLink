# AGENTS.md

Operational guide for AI coding agents working in this repository. Product context: [docs/PRD.md](docs/PRD.md). Current status: [docs/progress.md](docs/progress.md).

## Project

LactaLink is a platform for breastmilk donation and distribution connecting donors, recipients, and organizations (hospitals, milk banks), with medical screening, identity verification, and safety built in. Monorepo layout:

- `apps/mobile` — React Native (Expo) app for donors/recipients/organizations
- `apps/web` — Next.js admin panel **and** backend: Payload CMS (collections, hooks, custom endpoints), Supabase integration
- `packages/api` — shared API client (`ApiClient`) consumed by mobile
- `packages/form-schemas` — shared zod form schemas (mobile + web)
- `packages/types` — shared TypeScript types; receives generated Payload types
- `packages/enums`, `packages/utilities` — shared enums and utilities
- `packages/agents` — TypeScript wrappers for library-specific logic, exposed via subpaths (`@lactalink/agents/payload`, `@lactalink/agents/expo`)
- `packages/eslint-config`, `packages/typescript-config` — shared configs
- `database/sql` — SQL triggers/functions applied manually via Supabase SQL editor
- `docs/` — product, architecture, and feature documentation

Boundary rules: apps import packages, packages never import apps. Code shared between mobile and web goes in a package, not one app.

## Commands

Run from the workspace root (pnpm only — this repo pins `pnpm@10`, Node `^24`):

- Install: `pnpm install`
- Build shared packages (required before first dev run or after pulling): `pnpm build:packages`
- Dev mobile: `pnpm dev:mobile` · Dev web: `pnpm dev:web` (both need `.env` — see below)
- Lint / fix: `pnpm lint` / `pnpm lint:fix`
- Test: `pnpm test` (vitest: `apps/web/tests`, `packages/api/tests`)
- Regenerate after changing Payload collections/fields/globals: `pnpm generate:types` (types), `pnpm generate:schema` (DB schema)
- Full clean rebuild: `pnpm refresh`

`dev` and `test` auto-run web `generate:schema` + `generate:types` first (Turbo pipeline), so **both commands require `apps/web/.env`** (copy from `apps/web/.env.example`). Mobile needs `apps/mobile/.env`. The web dev server binds port 3000; `pnpm dev:mobile-safe-adb` sets up ADB port forwarding for Android devices.

## Environment prerequisites

`apps/web/.env` and `apps/mobile/.env` are gitignored and must exist for dev/test/build. Templates: `apps/web/.env.example`, and CI (`apps/mobile/.env` in `.github/workflows/test.yml`) shows the mobile vars. `test` fails without a reachable `DATABASE_URI`. Database triggers in `database/sql/` are applied through the Supabase dashboard, not by any script.

## Generated files — regenerate, never hand-edit

- `apps/web/src/lib/types/payload-types.ts` and `packages/types/src/payload-types/generated.ts` → `pnpm generate:types`
- `apps/web/src/lib/db/drizzle/schema/payload-schema.ts` → `pnpm generate:schema`
- `apps/web/src/app/*/admin/importMap.js` → `pnpm generate:importmap`

After editing Payload collections, fields, hooks, or globals, run `pnpm generate:types` before type-dependent work; stale generated types are the usual cause of phantom type errors.

## Skills to load before specific work

- Payload work (collections, fields, hooks, access control, endpoints, `payload.config.ts`): read `.agents/skills/payload/SKILL.md` and its `reference/` files first.
- Mobile UI/styling (components, theming, variants): read `.agents/skills/gluestack-ui-v4/SKILL.md` first — it mandates gluestack components over RN primitives and semantic design tokens only.

Install new agent skills with `pnpx skills add <skill>` from the workspace root (tracked in `skills-lock.json`).

## Engineering rules

- TypeScript for all new code; named imports only (`import { useState } from 'react'`).
- Server state through TanStack React Query; client state through Zustand; forms with react-hook-form + zod schemas from `packages/form-schemas`.
- Keep Payload endpoints thin: business logic belongs in service layers under `apps/web/src/endpoints`/`packages/api/src`, following existing patterns.
- Shared logic for a specific library (payload, expo, supabase) goes in `packages/agents/src/<library>/`.
- Write vitest tests for new web endpoints and API-client functionality, alongside the existing suites in `apps/web/tests` and `packages/api/tests`.
- Anything shared between mobile and web must compile against both React Native and Next.js targets.
- Land changes only with `pnpm lint` and the relevant tests passing. Known exception: `apps/mobile` lint carries 8 pre-existing errors unrelated to new work (deleted map/markers modules — see [docs/progress.md](docs/progress.md) §Verification baseline); leave them unless the task is to fix them.

## Branching & merges

- Work branches never merge directly into `main`. Every work-branch PR targets `development`.
- `main` is reserved for production-level merges (`development` → `main` at release time).
- Merge work-branch PRs into `development` with **squash-merge** to keep `development`'s commit history uncluttered. Write the squash commit message following the `commit-work` skill: a Conventional Commits subject plus a bullet-point body — one bullet per logical change, stating what and why.

## Docs to keep living

- After completing a task: update [docs/progress.md](docs/progress.md) (status + next steps) — it is the source of truth for cross-session handoffs.
- After an architecture-relevant change: update [docs/architecture.md](docs/architecture.md).
- Record significant trade-offs as new ADRs in [docs/adr/](docs/adr/) using the template there — decisions are never re-litigated from scratch.
- Product scope questions resolve against [docs/PRD.md](docs/PRD.md); detailed feature behavior lives in [docs/features/](docs/features/INDEX.md); milestone order lives in [docs/plan.md](docs/plan.md).

## Agent skills

### Issue tracker

Issues live as local markdown files under `.scratch/<feature-slug>/`. See [docs/agents/issue-tracker.md](docs/agents/issue-tracker.md).

### Triage labels

Default five-label vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See [docs/agents/triage-labels.md](docs/agents/triage-labels.md).

### Domain docs

Single-context: root `GLOSSARY.md` + `docs/adr/`. See [docs/agents/domain.md](docs/agents/domain.md).
