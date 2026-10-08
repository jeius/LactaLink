# Tech Stack

Canonical stack reference with usage conventions. Rationale for the major choices lives in the [ADR index](adr/); per-package versions live in each `package.json` (the environment is the version source of truth).

## Languages & runtime

- **TypeScript everywhere** (strict, path-mapped via `typescript-transform-paths`); Node `^24`, pnpm `^10` (pinned in root `package.json`).
- **Turborepo** orchestrates tasks; the pipeline in `turbo.json` encodes real dependencies (e.g. `test`/`dev` wait for web type+schema generation).

## Apps

| Concern | Choice | Convention |
| --- | --- | --- |
| Mobile app | Expo 54 (SDK), Expo Router 6, React Native 0.81, React 19 | Dev-client builds via EAS (Expo Go unsupported — native modules). Routes under `app/(auth)` and `app/(root)` |
| Web + backend | Next.js 15 (App Router), React 19 | `apps/web` is the only backend; admin panel and API live together |
| CMS / API layer | Payload 3.x | Collections + hooks + custom endpoints; config-first — see ADR-0002 |
| DB | Supabase (PostgreSQL) via `@payloadcms/db-postgres` | Schema generated from Payload config — see ADR-0005 |
| Auth | Supabase Auth (email/password + Google OAuth) | Mobile uses Supabase clients directly; web bridges via SSR clients |
| Storage | Supabase Storage through Payload S3 adapter | One bucket per media type (see `apps/web/.env.example`) |
| Realtime | Supabase Realtime | Chat + notifications |
| Maps | Google Maps Platform (Maps, Routes/Routing, Places) | `GOOGLE_ROUTES_API_KEY` for distance/ETA |
| Email | Resend via Payload email adapter; Supabase SMTP for auth mail | |
| ID face-match | face-api.js (server-side, web) | |
| Address data | PSGC API (Philippine Standard Geographic Code) | |

## Frontend patterns (both apps)

| Concern | Choice |
| --- | --- |
| Server state | TanStack React Query |
| Client state | Zustand |
| Forms | react-hook-form + zod resolvers; shared schemas in `packages/form-schemas` |
| Validation | zod v4 |
| Styling — mobile | NativeWind 4 (Tailwind 3) + gluestack-ui v4; semantic design tokens only (`.agents/skills/gluestack-ui-v4/SKILL.md`) |
| Styling — web | Tailwind CSS 4 + shadcn/radix-style primitives |
| Icons | lucide (react / react-native) |

Note the intentional Tailwind major-version split (3 on mobile via NativeWind, 4 on web) — do not "upgrade one to match the other" casually; NativeWind compatibility is the constraint.

## Tooling

- **Lint/Format**: ESLint 9 (flat config, shared `packages/eslint-config`) + Prettier (with `prettier-plugin-tailwindcss`).
- **Tests**: Vitest (+ `@vitest/coverage-v8`). Suites live in `apps/web/tests` and `packages/*/tests`.
- **Docs**: TypeDoc for code-level documentation.
- **Mobile distribution**: EAS (`eas-build-pre-install` rebuilds workspace packages); `expo-updates` for OTA on the preview channel.
- **CI/CD**: GitHub Actions (`.github/workflows/`) — `test.yml` gates PRs with lint + build + test; Vercel for web; Docker/Northflank path documented in `docs/deployment/`.
- **Agent skills**: `pnpx skills add <skill>` from workspace root into `.agents/skills/` (tracked by `skills-lock.json`); repo-local skills: `payload`, `gluestack-ui-v4`.

## Decision records

| ADR | Decision |
| --- | --- |
| [0001](adr/0001-monorepo-turborepo-pnpm.md) | Turborepo + pnpm workspace monorepo |
| [0002](adr/0002-payload-cms-nextjs-backend.md) | Payload CMS on Next.js as the single backend |
| [0003](adr/0003-supabase-postgres-auth-storage-realtime.md) | Supabase for Postgres, auth, storage, realtime |
| [0004](adr/0004-expo-dev-client-not-expo-go.md) | Expo dev-client builds, not Expo Go |
| [0005](adr/0005-generated-types-and-db-schema.md) | Types & DB schema generated from Payload config |
| [0006](adr/0006-nativewind-gluestack-ui-v4-mobile-styling.md) | NativeWind + gluestack-ui v4 for mobile styling |
