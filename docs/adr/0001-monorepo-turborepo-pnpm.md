# 0001. Turborepo + pnpm workspace monorepo

Date: backfilled 2026-10-08 · Status: accepted

## Context

LactaLink ships two apps (Expo mobile, Next.js web+backend) that share an API client, form schemas, types, enums, and utilities. Duplicating that code across repos guarantees drift — especially types, which must stay in lockstep with the Payload backend.

## Decision

A single Turborepo-managed pnpm workspace: `apps/*` plus shared `packages/*`, wired with `workspace:*` dependencies. The Turbo pipeline (`turbo.json`) encodes real task dependencies — e.g. `test` and `dev` wait for Payload type + schema generation.

## Consequences

- Shared code changes propagate to both apps in one commit; type mismatches surface at build time, not in production.
- `pnpm build:packages` (or `pnpm refresh`) is required after pulls and before first dev runs — packages compile to `dist/` before apps consume them.
- CI must set up the whole monorepo even to test one app (see `.github/actions/setup-monorepo`); task caching keeps this affordable.
- Cross-platform code (React Native + Next.js) in shared packages must compile against both targets — a standing constraint on every package change.
