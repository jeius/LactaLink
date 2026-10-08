# 0003. Supabase for Postgres, auth, storage, and realtime

Date: backfilled 2026-10-08 · Status: accepted

## Context

The backend needs a managed Postgres, an auth provider with Google OAuth and email OTP, file storage, and realtime channels for chat/notifications. Self-hosting any of these is ops burden with no product differentiation.

## Decision

Use Supabase as the single provider: Postgres via `@payloadcms/db-postgres`, Supabase Auth (email/password + Google OAuth) as the identity provider bridged into Payload, Supabase Storage through Payload's S3 adapter (one bucket per media type), and Supabase Realtime for chat and notifications.

## Consequences

- Auth lives *outside* Payload: SQL triggers in `database/sql/triggers/` keep Supabase `auth.users` and the Payload `users` collection in sync, and are applied manually via the Supabase SQL editor — schema changes to users need a trigger review.
- Realtime traffic bypasses Payload entirely (mobile talks straight to Supabase); access rules for realtime live in Supabase (RLS), not Payload access control — a second security surface to keep in mind.
- Storage bucket policy is environment config (`S3_BUCKET_*` vars), not code.
- Strong single-vendor coupling: leaving Supabase later means replacing four subsystems at once. Accepted for the speed it buys now.
