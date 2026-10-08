# Product Requirements Document (PRD)

One-page brief for LactaLink. Detailed feature behavior lives in [features/INDEX.md](features/INDEX.md); technical detail in [technical-architecture/INDEX.md](technical-architecture/INDEX.md).

## Problem

Safe donor breastmilk exists (lactating parents with surplus) and demand exists (infants whose mothers cannot breastfeed), but the two sides struggle to find each other safely. Informal milk sharing lacks medical screening, identity trust, tracking, and logistics — putting infant health at risk.

## Audience

- **Donors (Individual)** — lactating individuals with surplus milk, needing a trusted way to donate safely.
- **Recipients (Individual)** — parents/caregivers of infants who need donated milk, by general or direct request.
- **Organizations** — hospitals and milk banks that receive, process, store, and distribute milk at scale.
- **Administrators** — platform staff managing users, verifications, screening review, and content.

Philippines-first: addresses use PSGC (Philippine Standard Geographic Code) data; delivery is currently human-arranged (meet-up/drop-off), not couriered.

## Core value proposition

Connect donors, recipients, and organizations with **medical approval, safety, and convenience** baked in: verified identities, donor screening, per-bag milk tracking, and location-aware matching.

## Scope

**Must-have (core loop):**

1. Account creation — email/password or Google OAuth, OTP email verification, profile type selection (Individual / Hospital / Milk Bank).
2. Identity verification — government ID + selfie, automated face match (face-api.js), admin manual review fallback.
3. Donor screening — screening application with admin approval gate before donating.
4. Donation management — milk bag registration (volume, date, storage, unique tracking code + photo), donation creation, allocation tracking.
5. Request management — request creation (volume, urgency, needed-by), fulfillment tracking, accept/decline offers, receipt confirmation.
6. Transactions — donation↔request matching, partial/complete allocation, status lifecycle.
7. Messaging & notifications — in-app chat (Supabase Realtime), notification preferences.
8. Geographic services — addresses with PSGC data, maps, nearby search, distance/travel-time estimates.
9. Admin panel — user management, verification & screening review, content and data management.

**Nice-to-have (see [features/INDEX.md](features/INDEX.md) §Future Features):** analytics dashboards, community forums, QR/barcode milk scanning, donor incentives, supply-chain features, delivery scheduling/negotiation/tracking.

**Non-goals (current):** payment processing, courier-integrated logistics, regions outside the Philippines.

## Primary user stories

- As a **donor**, I register my milk bags with trackable codes, pass screening once, then create donations targeted at a recipient, an organization, or the general pool — and follow each donation to receipt.
- As a **recipient**, I create a request with volume and urgency, receive offers, accept full or partial fulfillment, and confirm receipt so donation history stays trustworthy.
- As a **hospital/milk bank**, I receive direct donations, fulfill requests from my inventory, and track storage and distribution.
- As an **admin**, I review identity verifications and screening applications, manage accounts (including soft delete), and audit the donation lifecycle.

Every story shares one invariant: **unverified or unscreened participants cannot enter the donation loop.**

## Constraints

- Mobile-first: Android & iOS via a single Expo codebase; web exists for administration.
- Stack is fixed (see [tech-stack.md](tech-stack.md)) — Supabase Postgres, Supabase Auth, Payload CMS on Next.js, Google Maps Platform, Resend.
- Safety/medical-approval workflows are regulatory-adjacent: changes to verification, screening, or milk-bag tracking need explicit admin-facing review paths.

## Success signals

- Donations progress from creation to confirmed receipt without dead-ends.
- Verification and screening review turnaround stays low (admin queue visible).
- Recipients find and fulfill requests through the platform rather than off-platform.
