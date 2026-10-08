# 0005. Types and DB schema generated from the Payload config

Date: backfilled 2026-10-08 · Status: accepted

## Context

The same data model needs three representations: the Postgres schema, Payload's TypeScript types, and — because the mobile app consumes them through shared packages – those types inside the monorepo's type package. Hand-maintaining three copies of one model is guaranteed drift.

## Decision

The Payload config is the single source of truth; everything else is generated:

- `pnpm generate:types` → `apps/web/src/lib/types/payload-types.ts` **and** `packages/types/src/payload-types/generated.ts` (shared with mobile).
- `pnpm generate:schema` → `apps/web/src/lib/db/drizzle/schema/payload-schema.ts` (DB schema for the postgres adapter).
- `pnpm generate:importmap` → Payload admin `importMap.js`.

The Turbo pipeline runs schema + type generation before `dev` and `test`, so generated files are refreshed automatically at the start of any session that needs them.

## Consequences

- Generated files are never hand-edited; edits vanish on the next generation. All model changes start in `payload.config.ts`/collections.
- Phantom type errors after collection edits almost always mean stale generation — rerun `pnpm generate:types` before debugging.
- Generation requires `apps/web/.env` (Payload boots to introspect the config), which makes env a prerequisite for dev/test, not just runtime.
- Postgres-level objects that Payload cannot express (triggers, some functions/indexes) live in `database/sql/` and are applied manually through Supabase — they are the one sanctioned hand-written SQL surface.
