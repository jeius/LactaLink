# Architecture

Repo-level architecture: module boundaries, code layout, and generated-code flow. For system-level design (external services, integrations, security), see [technical-architecture/INDEX.md](technical-architecture/INDEX.md). Stack rationale: [tech-stack.md](tech-stack.md).

## Monorepo dependency graph

```text
apps/mobile ──────────────┐
apps/web (Next.js+Payload)─┤
                           ▼
        packages/api · form-schemas · types · enums · utilities · agents
                           ▼
              packages/eslint-config · typescript-config
```

- **Apps consume packages; packages never import apps.** Code needed by both apps is promoted into a package.
- `packages/agents` wraps library-specific logic (payload, expo) behind subpath exports so apps depend on wrappers, not library internals.
- Mobile talks to the backend exclusively through `packages/api`'s `ApiClient` (Payload REST) and Supabase clients (auth, realtime); it has no direct DB access.

## apps/web — admin panel + backend (source of truth for data)

| Path | Role |
| --- | --- |
| `src/payload.config.ts` | Payload config — the root of all collection/field/hook definitions |
| `src/collections/` | Payload collections (users, profiles, donations, requests, transactions, screening, …) |
| `src/endpoints/` | Custom REST endpoints (business logic in service layers, controllers thin) |
| `src/hooks/`, `src/fields/`, `src/globals/`, `src/jobs/` | Payload hooks, custom fields, globals, background jobs |
| `src/app/(payload)/` | Payload admin UI |
| `src/lib/db/drizzle/schema/` | **Generated** DB schema (from `payload generate:db-schema`) |
| `src/lib/types/payload-types.ts` | **Generated** Payload types |
| `tests/` | Vitest suites (e.g. transaction system) |

## apps/mobile — Expo Router app

| Path | Role |
| --- | --- |
| `app/(auth)/`, `app/(root)/` | Expo Router route groups (auth flows vs. authenticated tabs) |
| `components/` | Shared mobile components (gluestack-ui v4 + NativeWind styling) |
| `lib/` | App utilities; server access via `@lactalink/api` and Supabase clients |

## Generated-code flow (single direction)

```text
payload.config.ts + collections/fields/hooks
   ├─ pnpm generate:types  → apps/web/src/lib/types/payload-types.ts
   │                          packages/types/src/payload-types/generated.ts
   ├─ pnpm generate:schema → apps/web/src/lib/db/drizzle/schema/payload-schema.ts
   └─ pnpm generate:importmap → apps/web/src/app/*/admin/importMap.js
```

Hand-editing any generated file is wasted work — the next generation overwrites it. Change the Payload config, regenerate, and let types flow to consumers.

## Runtime data flow

1. Mobile reads/writes through `ApiClient` → Payload REST endpoints on `apps/web`.
2. Payload persists to Supabase Postgres; storage goes through the S3 adapter to Supabase Storage (bucket-per-media-type, see `apps/web/.env.example`).
3. Auth flows through Supabase Auth (email/password + Google OAuth); Postgres triggers in `database/sql/triggers/` keep `auth.users` and the Payload `users` collection in sync (applied via Supabase SQL editor, not migrations).
4. Realtime (chat, notifications) flows through Supabase Realtime, bypassing Payload.
5. External services: Google Maps (geocoding, routing), PSGC API (Philippine address data), Resend (transactional email).

## Conventions that keep this architecture intact

- New shared type → `packages/types`; new enum → `packages/enums`; new zod schema → `packages/form-schemas`; new utility → `packages/utilities`. Cross-app code lands in the right package on first move, not after duplication.
- Library-specific wrapper needed by both apps → `packages/agents/src/<library>/` with a subpath export.
- Soft delete pattern: users/profiles use trash/soft-delete with auth-user cleanup triggers — follow it for user-adjacent data instead of hard deletes.

## ADRs

Significant architecture decisions and their trade-offs are recorded in [adr/](adr/). Check there before revisiting a past decision; add a new ADR when making a decision of similar weight.
