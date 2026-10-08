# Roadmap

Phased milestones for LactaLink. Status is tracked in [progress.md](progress.md) — this file defines *order and scope*, progress.md records *where we are*. Feature detail: [features/INDEX.md](features/INDEX.md).

_Red-penciled 2026-10-08 against a code audit at `8ffd6bc4`: every milestone now carries a checkbox list — `- [✅]` = shipped (code-evidenced), `- [ ]` = remaining — with M5/M6 gaining partially-landed status and the community feed getting its own milestone (M8). Numbering is kept stable to preserve cross-references._

## Milestones

### M0 — Foundation ✅

- [✅] Monorepo + CI
- [✅] Payload + Supabase integration
- [✅] Account creation (email/Google + OTP + profile type selection)
- [✅] Admin panel skeleton

### M1 — Core donation & request loop ✅ (maintenance)
The platform's reason to exist. Specs: [DONATION_MANAGEMENT](features/DONATION_MANAGEMENT.md), [REQUEST_MANAGEMENT](features/REQUEST_MANAGEMENT.md).

- [✅] Milk bag registration with tracking codes
- [✅] Donation creation/allocation
- [✅] Request creation/fulfillment
- [✅] Transaction lifecycle
- [✅] History

_Impact stats were never built — moved to M7 analytics on 2026-10-08; the original "history and impact stats" claim is retained here as history._

### M2 — Trust & safety 🔄 primary
Identity verification (ID + selfie, face-api.js auto-match, admin review) and donor screening application + admin approval gate. Profile management completion (edit flow, addresses, account settings, soft delete). Spec: [ID_VERIFICATION](features/ID_VERIFICATION.md).

- [✅] ID verification end-to-end (mobile wizard incl. face capture, `Identities` collection, face-api job + workflow, verification endpoint)
- [✅] Donor screening, donor-side and org-side (form-builder plugin collections, submission wizard, org form editor)
- [✅] Account deletion, soft delete + trash with auth-cleanup triggers, Account Settings screen
- [ ] Screening admin review/approval (wire the staged `SCREENING_STATUS` enum into submissions plus an admin queue)
- [ ] Donation-gate enforcement — unscreened/unverified donors cannot create donations (the PRD invariant is currently unenforced in access control; depends on the review workflow above)
- [ ] Finish the profile/settings screens still marked In Progress

### M3 — Communication 🔄
In-app messaging (direct + group chat over Supabase Realtime), notification system with per-category/channel preferences.

- [✅] Chat: direct + group creation, Conversations/Messages/reactions/reads/attachments collections, Realtime channels
- [✅] Notification receiving (collection + categories/channels/types taxonomy, notifications tab, mark-read)
- [ ] Per-category/channel notification preferences (no backend collection or UI exists yet)
- [ ] Chat hardening per feature docs

### M4 — Geographic services 🔄
Nearby donor/recipient search, interactive map of donations/requests, distance & travel-time estimates, directions.

- [✅] Map-markers and directions endpoints (Google Routing), near donations/requests/organizations endpoints
- [✅] Explore map with search input, org-details directions navigation, details-sheet CTA routing
- [✅] Infinite-scroll search
- [ ] Nearby donor/recipient search *results* UI on top of the map search input

### M5 — Organization features 🔄 (partially landed — previously untracked)
Hospital/milk-bank experience: direct donation reception, request fulfillment from inventory, milk inventory tracking (volume, storage conditions, expiry), distribution reporting. Spec: [features/INDEX.md §Organization Features](features/INDEX.md).

- [✅] `Inventory` collection (initial/remaining/reserved volume, status, expiry, input bags) + `InventoryAllocations`, `updateOrganizationStock` background job
- [✅] Mobile inventory screens
- [✅] O2P org-fulfills-request transactions
- [ ] Distribution reporting
- [ ] Storage-condition monitoring (expiry tracking exists, conditions don't)

### M6 — Delivery system 🔄 (substantially landed — previously untracked)
Delivery scheduling and negotiation, delivery tracking with status updates. Spec: [DELIVERY_SYSTEM](features/DELIVERY_SYSTEM.md).

- [✅] Delivery negotiation (propose/accept/reject/supersede proposals via `DeliveryDetails`, preset + custom time slots, mobile propose screen)
- [✅] Delivery tracking (`DeliveryUpdates` lifecycle: waiting → preparing → pickup-ready/on-the-way → arrived → delivered, plus delayed)
- [ ] Reconcile the DELIVERY_SYSTEM/MATCHING_SYSTEM spec vocabulary with the implemented status model (docs say MATCHED / PENDING_DELIVERY_CONFIRMATION / DELIVERY_SCHEDULED as transaction statuses; code uses PENDING / CONFIRMED / PREPARING… and adds an O2O type)
- [ ] Enforce receiver-only completion in `completeTransaction` (only the DELIVERED precondition is checked today) and verify failed/cancelled remediation paths against the spec

### M7 — Growth & polish

- [ ] Analytics dashboards (including donor impact metrics, moved here from M1)
- [ ] QR/barcode milk scanning
- [ ] Donor incentive program
- [ ] Supply-chain features

_(Community forums moved out — see M8.)_

### M8 — Community 🔄 (partially landed — dedicated track)
The community feed.

- [✅] Posts/Comments/Likes collections, mobile feed tab
- [✅] Post create/edit and comments screens
- [ ] Define the feed's polish backlog (candidates from the audit: moderation tooling; wiring the unused `BlockedUsers` collection; surfacing the existing read-tracking data)

## Working rules

- One milestone is **primary** at a time; small items from other milestones may interleave (relaxed 2026-10-08 — progress.md had been recording concurrent M2/M3/M4 work).
- **Close-out first**: finish partially-shipped milestones (M2 → M3 → M4 → M5 → M6 remainders, then M8 polish) before opening new scope (M7).
- Within a milestone, tasks are sliced small and independently verifiable (objective + acceptance criteria + target files + verification command), batched by subsystem so a work session touches one area.
- A checkbox flips from `- [ ]` to `- [✅]` only once the work is verified (lint + relevant tests per [AGENTS.md](../AGENTS.md), or a live check for UX items) — a tick is an evidence claim, always in the ✅ form, never plain `[x]`.
- Each task follows the loop: implement → test → review diff → update `progress.md` → commit.
- M1 bugs are fixed in place regardless of active milestone — the core loop always ships working.
