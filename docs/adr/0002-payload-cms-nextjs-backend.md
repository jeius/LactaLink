# 0002. Payload CMS on Next.js as the single backend

Date: backfilled 2026-10-08 · Status: accepted

## Context

The platform needs an admin panel for verification/screening review and user management, REST APIs for the mobile app, file/media handling, background jobs, and transactional email. Building all of that bespoke on a bare Next.js API is months of undifferentiated work.

## Decision

`apps/web` is a Next.js 15 app with Payload 3 as the single backend: collections define the data model, hooks carry business rules, custom endpoints (`src/endpoints/`) extend REST where the mobile app needs purpose-built contracts, and the Payload admin panel *is* the admin product. Business logic lives in service layers; endpoint handlers stay thin.

## Consequences

- Admin UI, API, validation, and media handling come from one config-first source: `src/payload.config.ts` plus collections/fields/hooks.
- Every data-model change flows through the Payload config and a regeneration step (see [0005](0005-generated-types-and-db-schema.md)) — direct DB edits are off the table.
- The team is effectively all-in on Payload idioms; agents working on collections/hooks/access must load `.agents/skills/payload/SKILL.md` first.
- Server-side features needing raw Node (face-api.js with canvas, sharp) run inside this app — a constraint on hosting (Docker image includes native deps; see `docs/deployment/`).
