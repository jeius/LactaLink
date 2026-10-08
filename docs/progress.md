# Progress

Living status document — the source of truth for cross-session handoffs. **Update this file after every completed task** (status + next steps), per the loop in [plan.md](plan.md). Milestone definitions: [plan.md](plan.md).

_Last updated: 2026-10-08 (roadmap red-penciled against a code audit at `8ffd6bc4` — milestone statuses now match the code; see [plan.md](plan.md))._

## Where we are

**M2 Trust & safety is the primary milestone**, with small items interleaving from M3/M4 as they have been. M0–M1 are complete and in maintenance. The red-pencil surfaced that **M5 (organization inventory), M6 (delivery scheduling/negotiation/tracking), and the new M8 (community feed) are also partially landed** — their remainders are now explicit in [plan.md](plan.md) and queue behind M2–M4 per the close-out-first rule.

## Recently completed

- **M2** — Donor screening application flow and UI components; query for approved screening submissions by user.
- **M2** — Account deletion with confirmation modal; soft delete for users with auth-cleanup; trash option on profiles collection and profile queries; Account Settings screen; restructured auth routes.
- **M3** — Chat: group/direct chat creation via `UserSearchInput` + `InfiniteFlashList`, populated participant data, unknown-user fallback in last-message rendering.
- **M4** — Explore screen map search input; directions/navigation from organization details; details-sheet CTA routing for donations/requests; infinite-scroll search.
- **Cross-cutting** — `LetterBox` responsive layout component (tablet detection); delivery form support for organization recipients; profile editing flow and layout improvements.

### Shipped but previously untracked in the roadmap (found by the 2026-10-08 audit)

- **M5** — Organization inventory: `Inventory` + `InventoryAllocations` collections, `updateOrganizationStock` job, mobile `account/inventory` screens, O2P fulfillment.
- **M6** — Delivery negotiation and tracking: proposal accept/reject/supersede via `DeliveryDetails`, time slots, `DeliveryUpdates` lifecycle, mobile `transactions/propose` screen.
- **M8** — Community feed: `Posts`/`Comments`/`Likes` collections, feed tab, post create/edit/comments screens.
- **Extras** — read-tracking (`DonationReads`/`RequestReads`/`TransactionReads` + `ReadTrackingService`), hospitals/milk-banks directory screens, PSGC seeder endpoints. The `BlockedUsers` collection exists but is wired to nothing (M8 candidate).

## In progress

- Profile management polish (edit flow, addresses, delivery preferences) — [features/INDEX.md](features/INDEX.md) marks it In Progress.
- Settings (notification preferences, privacy) — In Progress per feature docs.
- In-app messaging hardening — In Progress per feature docs.

## Immediate next steps

Close-out-first order (see [plan.md](plan.md) working rules):

1. **M2** — Finish the screening flow: admin-side review/approval of screening applications (wire the staged `SCREENING_STATUS` enum) and the donation-gate enforcement (unscreened/unverified donors blocked from creating donations).
2. **M2** — Complete the profile management + settings screens still marked In Progress.
3. **M3** — Per-category/channel notification preferences: backend collection + mobile settings UI.
4. **M4** — Nearby donor/recipient search results UI on top of the map search input.
5. **M6** — Reconcile DELIVERY_SYSTEM/MATCHING_SYSTEM spec vocabulary with the implemented status model; enforce receiver-only completion in `completeTransaction`.
6. Grow vitest coverage for the transaction system and screening endpoints alongside feature work.
7. Repair the `apps/mobile` lint baseline (see Verification baseline below) — decide per import whether the target module should be restored or the import rewritten, then clear the warning backlog with `pnpm lint:fix`.

## Verification baseline

- `pnpm lint` (2026-10-08): web + all shared packages green; **`apps/mobile` fails with 8 pre-existing `import/no-unresolved` errors** — fallout from the map/markers refactor, not related to docs:
  - 4 files import a deleted module `components/contexts/markers/DataMarker` (`components/map/MapMarkerInfo.tsx`, `components/tabs/MapBottomSheetTabs.tsx`, `features/donation&request/components/ExploreDonationsTab.tsx`, `ExploreRequestsTab.tsx`)
  - `components/forms/setup-profile/type/index.tsx` imports missing `@/components/ui/center`
  - `components/ui/sheet/bottom-sheet/context.ts` imports `../types`, which doesn't exist (sibling `./types` does)
  - `lib/constants/env.ts` imports `@env` (babel/react-native-dotenv alias — eslint resolver gap)
  - `lib/types/markers.ts` imports `react-native-maps`, which is not installed (maps come via `react-native-google-maps-plus`; likely type-only usage)
  - Mobile also carries 339 warnings (mostly `no-restricted-imports` for default React imports).
- `pnpm test` requires `apps/web/.env` with a reachable `DATABASE_URI` (Turbo generates schema + types first); CI runs the full gate on PRs.
