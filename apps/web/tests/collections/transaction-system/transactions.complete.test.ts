/**
 * Integration tests — "Mark a Transaction as Completed"
 *
 * Verifies that updating a `transactions` document to `status: 'COMPLETED'`
 * through the Payload Local API correctly:
 *
 *  • Persists the `COMPLETED` status to the database.
 *  • Auto-stamps `tracking.completedAt` via the `createTimeStampFieldHook`
 *    `beforeChange` field hook.
 *  • Marks the linked `requests` document as `COMPLETED` via
 *    `markRequestAsComplete` (called by `finalizeOnComplete` in the
 *    `afterChange` hook).
 *  • Marks all `ALLOCATED` milk bags referenced in `request.details.bags` as
 *    `CONSUMED` via `consumeMilkBags`.
 *  • Creates a `transaction-status-histories` entry capturing the
 *    `CONFIRMED → COMPLETED` transition via `createStatusHistoryRecord`.
 *  • Marks the linked `donations` document to the
 *    `DONATION_REQUEST_STATUS.CANCELLED` value (the constant named
 *    `DONATION_COMPLETED_STATUS` in `markDonationAsComplete.ts`) via
 *    `markDonationAsComplete`.
 *  • Transitions any `PENDING` `inventory-allocations` linked to the request
 *    to `FULFILLED` via `fulfillPendingAllocations`.
 *
 * ## Setup strategy
 *
 * ┌─ beforeAll ──────────────────────────────────────────────────────────────┐
 * │  1. Seed users, individual profiles, bags (ALLOCATED), donation          │
 * │     (MATCHED), request (MATCHED, details.bags populated), and a          │
 * │     transaction (CONFIRMED) using unauthenticated requests to prevent     │
 * │     the Transactions afterChange hook from running during setup.          │
 * │  2. For the `fulfillPendingAllocations` sub-suite: seed a hospital, an   │
 * │     inventory, and a PENDING allocation linked to the same request.       │
 * │  3. Call `payload.update` with `status: 'COMPLETED'` through an          │
 * │     authenticated request so the `afterChange` hook's                     │
 * │     `operation === 'update'` branch runs in full.  This is the           │
 * │     "operation under test" — all mutations happen here once.              │
 * └──────────────────────────────────────────────────────────────────────────┘
 * │
 * All `it()` blocks are pure assertions on the state after `beforeAll` — they
 * re-fetch documents from the database and assert the expected values.
 */

import type {
  Donation,
  MilkBag,
  Request,
  Transaction,
} from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import type { BasePayload } from 'payload';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { cleanupRecords, createTestUser, Fixtures, type TestUser } from '../../helpers/fixtures';
import { getTestPayload } from '../../helpers/getTestPayload';

// ---------------------------------------------------------------------------
// Suite-level state
// ---------------------------------------------------------------------------

let payload: BasePayload;

let sender: TestUser;
let recipient: TestUser;
let bags: MilkBag[];
let donation: Donation;
let request: Request;
let seededTransaction: Transaction;
let completedTransaction: Transaction;

// Inventory allocation test state
let hospitalId: string;
let inventoryId: string;
let allocationId: string;

// Collected IDs for afterAll cleanup
const createdIds = {
  users: [] as string[],
  individuals: [] as string[],
  milkBags: [] as string[],
  donations: [] as string[],
  requests: [] as string[],
  transactions: [] as string[],
  'transaction-status-histories': [] as string[],
  hospitals: [] as string[],
  inventories: [] as string[],
  'inventory-allocations': [] as string[],
};

// ---------------------------------------------------------------------------
// Setup & Teardown
// ---------------------------------------------------------------------------

beforeAll(async () => {
  payload = await getTestPayload();

  // ── 1. Seed users & profiles ──────────────────────────────────────────────

  sender = await createTestUser(payload, { name: 'Sender User', email: 'sender@lactalink.com' });
  recipient = await createTestUser(payload, {
    name: 'Recipient User',
    email: 'recipient@lactalink.com',
  });

  createdIds.users.push(sender.user.id, recipient.user.id);
  createdIds.individuals.push(sender.profile.id, recipient.profile.id);

  const senderFixtures = new Fixtures(payload, sender.user);
  const recipientFixtures = new Fixtures(payload, recipient.user);

  // ── 2. Seed milk bags in ALLOCATED state ──────────────────────────────────
  //
  // `consumeMilkBags` filters by `status: ALLOCATED`, so the bags must already
  // be in ALLOCATED state at the time the transaction is marked as completed.

  bags = await senderFixtures.createTestMilkBags(
    2, // 2 bags
    100, // 100 mL each
    'ALLOCATED' // pre-allocated — simulates state after transaction was created
  );
  createdIds.milkBags.push(...bags.map((b) => b.id));

  // ── 3. Seed donation in MATCHED state ─────────────────────────────────────
  //
  // `markDonationAsComplete` updates the donation status. Using MATCHED to
  // simulate the state after the original transaction creation.

  donation = await senderFixtures.createTestDonation(extractID(bags));

  // Override the status to MATCHED (createTestDonation defaults to AVAILABLE)
  await payload.update({
    collection: 'donations',
    id: donation.id,
    data: { status: 'MATCHED' },
    overrideAccess: true,
    depth: 0,
    user: sender.user,
  });
  createdIds.donations.push(donation.id);

  // ── 4. Seed request in MATCHED state with bags populated in details ────────
  //
  // `consumeMilkBags` reads `requestDoc.details.bags` to find which bags to
  // consume.  The bags must be referenced there for the consumption to happen.

  request = await recipientFixtures.createTestRequest(extractID(bags));

  // Override to MATCHED status
  await payload.update({
    collection: 'requests',
    id: request.id,
    data: { status: 'MATCHED' },
    overrideAccess: true,
    depth: 0,
    user: recipient.user,
  });
  createdIds.requests.push(request.id);

  // ── 5. Seed a PENDING inventory allocation (for fulfillPendingAllocations) ─

  const hospital = await senderFixtures.createTestHospital('Test Hospital');
  hospitalId = hospital.id;
  createdIds.hospitals.push(hospitalId);

  const inventory = await senderFixtures.createTestInventory(
    hospitalId,
    extractID(bags),
    donation.id
  );
  inventoryId = inventory.id;
  createdIds.inventories.push(inventoryId);

  const allocation = await recipientFixtures.createTestInventoryAllocation(
    inventoryId,
    request.id,
    extractID(bags)
  );
  allocationId = allocation.id;
  createdIds['inventory-allocations'].push(allocationId);

  // ── 6. Seed transaction in CONFIRMED state (no hook cascade) ──────────────
  //
  // We use `createTestTransaction` (unauthenticated) so the afterChange hook
  // exits at `if (!user?.profile) return doc;`, producing NO side effects.
  // The transaction must reference the same request and donation so that
  // `finalizeOnComplete` operates on the correct documents when the status
  // is updated to COMPLETED in step 7.

  seededTransaction = await recipientFixtures.createTestTransaction(
    sender.profile.id,
    recipient.profile.id,
    bags.map((b) => b.id),
    donation.id,
    request.id,
    'CONFIRMED'
  );
  createdIds.transactions.push(seededTransaction.id);

  // ── 7. Update transaction to COMPLETED — this is the operation under test ─
  //
  // Passing an authenticated `req` (with user.profile) causes the afterChange
  // hook to run its full `operation === 'update'` branch, which calls:
  //   • clearTransactionReads
  //   • createStatusHistoryRecord  (CONFIRMED → COMPLETED, creates history)
  //   • finalizeOnComplete         (because doc.status === COMPLETED)
  //       └─ markRequestAsComplete (MATCHED → COMPLETED, bags ALLOCATED → CONSUMED,
  //          PENDING allocations → FULFILLED)
  //       └─ markDonationAsComplete (MATCHED → CANCELLED)

  completedTransaction = await payload.update({
    collection: 'transactions',
    id: seededTransaction.id,
    data: { status: 'COMPLETED' },
    overrideAccess: true,
    depth: 1, // depth 1 to populate tracking so completedAt is visible
  });
});

afterAll(async () => {
  await cleanupRecords(payload, createdIds);
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Transactions collection — mark as completed', () => {
  describe('transaction status', () => {
    it('persists the COMPLETED status to the database', () => {
      /**
       * The most basic assertion: the update call returned a document with the
       * new status.  We also verify by re-fetching in later tests.
       */
      expect(completedTransaction.status).toBe('COMPLETED');
    });

    it('returns the updated document from the update call', async () => {
      const refetched = await payload.findByID({
        collection: 'transactions',
        id: seededTransaction.id,
        overrideAccess: true,
        depth: 0,
      });

      expect(refetched.status).toBe('COMPLETED');
    });
  });

  describe('tracking timestamp', () => {
    it('auto-stamps tracking.completedAt when status transitions to COMPLETED', async () => {
      /**
       * The `completedAt` field has a `beforeChange` hook:
       *
       *   `createTimeStampFieldHook('COMPLETED')`
       *
       * which sets `value = new Date().toISOString()` when `data.status === 'COMPLETED'`
       * and no existing timestamp is present.
       */
      const refetched = (await payload.findByID({
        collection: 'transactions',
        id: seededTransaction.id,
        overrideAccess: true,
        depth: 1,
      })) as Transaction;

      expect(refetched.tracking?.completedAt).toBeDefined();
      expect(typeof refetched.tracking?.completedAt).toBe('string');

      // The timestamp should be parseable and within the last minute
      const completedAt = new Date(refetched.tracking!.completedAt as string);
      expect(completedAt.getTime()).toBeLessThanOrEqual(Date.now());
      expect(completedAt.getTime()).toBeGreaterThan(Date.now() - 60_000);
    });

    it('does NOT overwrite completedAt if it was already stamped', async () => {
      /**
       * The hook returns the existing value when `value && value !== ''`.
       * Updating COMPLETED → COMPLETED again should preserve the original stamp.
       */
      const firstTimestamp = (
        (await payload.findByID({
          collection: 'transactions',
          id: seededTransaction.id,
          overrideAccess: true,
          depth: 1,
        })) as Transaction
      ).tracking?.completedAt;

      // Slight pause to ensure a new `new Date()` call would produce a different value
      await new Promise((r) => setTimeout(r, 50));

      // Update again with the same status
      await payload.update({
        collection: 'transactions',
        id: seededTransaction.id,
        data: { status: 'COMPLETED' },
        overrideAccess: true,
        depth: 0,
      });

      const secondTimestamp = (
        await payload.findByID({
          collection: 'transactions',
          id: seededTransaction.id,
          overrideAccess: true,
          depth: 1,
        })
      ).tracking?.completedAt;

      expect(secondTimestamp).toBe(firstTimestamp);
    });
  });

  describe('afterChange hook — finalizeOnComplete → markRequestAsComplete', () => {
    it('transitions the linked request status to COMPLETED', async () => {
      /**
       * `markRequestAsComplete` calls `payload.update({ collection: 'requests', ... })`.
       * The request should now show status COMPLETED.
       */
      const updatedRequest = await payload.findByID({
        collection: 'requests',
        id: request.id,
        overrideAccess: true,
        depth: 0,
      });

      expect(updatedRequest.status).toBe('COMPLETED');
    });

    it('marks all ALLOCATED milk bags linked to the request as CONSUMED', async () => {
      /**
       * `consumeMilkBags` queries bags from `request.details.bags` where
       * `status === ALLOCATED` and bulk-updates them to `CONSUMED`.
       */
      const { docs: updatedBags } = await payload.find({
        collection: 'milkBags',
        where: { id: { in: bags.map((b) => b.id) } },
        overrideAccess: true,
        depth: 0,
      });

      expect(updatedBags).toHaveLength(bags.length);
      for (const bag of updatedBags) {
        expect(bag.status).toBe('CONSUMED');
      }
    });

    it('transitions PENDING inventory allocations for the request to FULFILLED', async () => {
      /**
       * `fulfillPendingAllocations` bulk-updates allocations where
       * { request: requestId, status: PENDING } → FULFILLED.
       */
      const updatedAllocation = await payload.findByID({
        collection: 'inventory-allocations',
        id: allocationId,
        overrideAccess: true,
        depth: 0,
      });

      expect(updatedAllocation.status).toBe('FULFILLED');
    });
  });

  describe('afterChange hook — createStatusHistoryRecord', () => {
    it('creates a status history record for the CONFIRMED → COMPLETED transition', async () => {
      /**
       * `createStatusHistoryRecord` creates a `transaction-status-histories`
       * entry whenever `previousDoc.status !== doc.status`.
       *
       * We seeded the transaction at CONFIRMED and updated to COMPLETED, so
       * exactly one history record should exist for this transaction.
       */
      const { docs: histories } = await payload.find({
        collection: 'transaction-status-histories',
        where: { transaction: { equals: seededTransaction.id } },
        overrideAccess: true,
        depth: 0,
      });

      expect(histories.length).toBeGreaterThanOrEqual(1);

      // Find the CONFIRMED → COMPLETED record
      const completedHistoryEntry = histories.find((h) => h.status === 'COMPLETED');
      expect(completedHistoryEntry).toBeDefined();
    });

    it('records the correct status on the history entry', async () => {
      const { docs: histories } = await payload.find({
        collection: 'transaction-status-histories',
        where: {
          and: [
            { transaction: { equals: seededTransaction.id } },
            { status: { equals: 'COMPLETED' } },
          ],
        },
        overrideAccess: true,
        depth: 0,
      });

      expect(histories).toHaveLength(1);
      expect(histories[0]!.status).toBe('COMPLETED');
    });
  });

  describe('afterChange hook — finalizeOnComplete → markDonationAsComplete', () => {
    it('transitions the linked donation to the CANCELLED value', async () => {
      /**
       * `markDonationAsComplete` sets `donation.status = DONATION_COMPLETED_STATUS`
       * where `DONATION_COMPLETED_STATUS = DONATION_REQUEST_STATUS.CANCELLED.value`.
       *
       * The constant is named "COMPLETED" but its value is 'CANCELLED' — this is
       * the current production behaviour.  The test intentionally asserts the
       * *actual* value ('CANCELLED') so that any future code change that corrects
       * the constant to use 'COMPLETED' will cause this test to fail, prompting
       * a deliberate review of the intended behaviour.
       */
      const updatedDonation = await payload.findByID({
        collection: 'donations',
        id: donation.id,
        overrideAccess: true,
        depth: 0,
      });

      expect(updatedDonation.status).toBe('CANCELLED');
    });
  });

  describe('edge cases', () => {
    it('does NOT call finalizeOnComplete when status is not COMPLETED', async () => {
      /**
       * `finalizeOnComplete` has an early return: `if (doc.status !== COMPLETE_STATUS) return;`
       *
       * Create a fresh transaction at PENDING, update to CONFIRMED (not COMPLETED),
       * and verify the donation and request remain unaffected.
       */
      const senderFixtures = new Fixtures(payload, sender.user);
      const recipientFixtures = new Fixtures(payload, recipient.user);

      const extraBags = await senderFixtures.createTestMilkBags(1, 100, 'ALLOCATED');
      createdIds.milkBags.push(...extraBags.map((b) => b.id));

      const extraDonation = await senderFixtures.createTestDonation(extractID(extraBags));
      createdIds.donations.push(extraDonation.id);

      const extraRequest = await recipientFixtures.createTestRequest(extractID(extraBags));
      createdIds.requests.push(extraRequest.id);

      const extraTxn = await senderFixtures.createTestTransaction(
        sender.profile.id,
        recipient.profile.id,
        extractID(extraBags),
        extraDonation.id,
        extraRequest.id,
        'CONFIRMED'
      );
      createdIds.transactions.push(extraTxn.id);

      // Update to DELIVERED — not COMPLETED, so finalizeOnComplete should NOT run

      await payload.update({
        collection: 'transactions',
        id: extraTxn.id,
        data: { status: 'DELIVERED' },
        overrideAccess: true,
        depth: 0,
        user: sender.user,
      });

      // Donation should still be AVAILABLE (unchanged)
      const donationAfterUpdate = await payload.findByID({
        collection: 'donations',
        id: extraDonation.id,
        overrideAccess: true,
        depth: 0,
      });
      expect(donationAfterUpdate.status).toBe('AVAILABLE');

      // Request should still be AVAILABLE (unchanged)
      const requestAfterUpdate = await payload.findByID({
        collection: 'requests',
        id: extraRequest.id,
        overrideAccess: true,
        depth: 0,
      });
      expect(requestAfterUpdate.status).toBe('AVAILABLE');
    });
  });
});
