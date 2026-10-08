# Architectural Decision Records

ADRs capture *why* a significant decision was made, so it is never re-litigated from scratch. Index of decisions:

| # | Decision | Status |
| --- | --- | --- |
| [0001](0001-monorepo-turborepo-pnpm.md) | Turborepo + pnpm workspace monorepo | Accepted |
| [0002](0002-payload-cms-nextjs-backend.md) | Payload CMS on Next.js as the single backend | Accepted |
| [0003](0003-supabase-postgres-auth-storage-realtime.md) | Supabase for Postgres, auth, storage, realtime | Accepted |
| [0004](0004-expo-dev-client-not-expo-go.md) | Expo dev-client builds, not Expo Go | Accepted |
| [0005](0005-generated-types-and-db-schema.md) | Types & DB schema generated from Payload config | Accepted |
| [0006](0006-nativewind-gluestack-ui-v4-mobile-styling.md) | NativeWind + gluestack-ui v4 for mobile styling | Accepted |

ADRs 0001–0006 were backfilled on 2026-10-08 from decisions already embodied in the codebase.

## Writing a new ADR

When making a decision of similar weight (new external service, data-layer change, cross-cutting pattern, breaking a convention above):

1. Copy the template below to `NNNN-short-title.md` (next free number).
2. Fill it in — the *consequences* section is the part future sessions actually read.
3. Add a row to the index above and, where relevant, a line in [../tech-stack.md](../tech-stack.md).

```markdown
# NNNN. Title

Date: YYYY-MM-DD · Status: proposed | accepted | superseded by NNNN

## Context

The forces at play: requirements, constraints, what made this decision necessary.

## Decision

What we chose, in one or two sentences.

## Consequences

What becomes easier, what becomes harder, what we now must do (or must avoid).
```
