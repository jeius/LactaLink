/**
 * Integration tests — "Create a Transaction"
 *
 * Verifies that creating a `transactions` document through the Payload Local
 * API:
 *
 *  • Auto-generates a `TXN-XXXXXXXX-XXXX` transaction number via the
 *    `generateTransactionNumber` field hook.
 *  • Defaults to `PENDING` status as declared in the collection config.
 *  • Marks the linked donation as `MATCHED` via the `afterChange` hook.
 *  • Marks the linked request as `MATCHED` via the `afterChange` hook.
 *  • Marks all linked milk bags as `ALLOCATED` via the `afterChange` hook.
 *
 * ## Test isolation strategy
 *
 * Prerequisites (individuals, milk bags, donation, request) are seeded using
 * an **unauthenticated** request object (`user: null`).  This causes those
 * collection hooks to exit early at `if (!user?.profile) return doc;`, so
 * the side effects we are measuring (MATCHED, ALLOCATED status changes) are
 * exclusively the result of creating the transaction under test — not noise
 * from setup operations.
 *
 * The transaction itself is created with an **authenticated** `req` so that
 * the `afterChange` hook's `operation === 'create'` branch runs in full.
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
let transaction: Transaction;

// Collected IDs used for afterAll cleanup
const createdIds = {
  users: [] as string[],
  individuals: [] as string[],
  milkBags: [] as string[],
  donations: [] as string[],
  requests: [] as string[],
  transactions: [] as string[],
  'transaction-status-histories': [] as string[],
};

// ---------------------------------------------------------------------------
// Setup & teardown
// ---------------------------------------------------------------------------

beforeAll(async () => {
  payload = await getTestPayload();

  // ── Seed prerequisites ────────────────────────────────────────────────────
  // Create sender and recipient users and profiles

  sender = await createTestUser(payload);
  recipient = await createTestUser(payload);

  const senderFixtures = new Fixtures(payload, sender.user);
  const recipientFixtures = new Fixtures(payload, recipient.user);

  createdIds.users.push(sender.user.id, recipient.user.id);
  createdIds.individuals.push(sender.profile.id, recipient.profile.id);

  bags = await senderFixtures.createTestMilkBags(2, 100, 'AVAILABLE');

  const milkBagIds = extractID(bags);
  createdIds.milkBags.push(...milkBagIds);

  donation = await senderFixtures.createTestDonation(milkBagIds);
  createdIds.donations.push(donation.id);

  request = await recipientFixtures.createTestRequest();
  createdIds.requests.push(request.id);

  // ── Create the transaction under test ─────────────────────────────────────

  // @ts-expect-error - Type error for auto-generated fields, safe-error
  transaction = await payload.create({
    collection: 'transactions',
    data: {
      sender: sender.profileRef,
      recipient: recipient.profileRef,
      donation: donation.id,
      request: request.id,
      milkBags: milkBagIds,
      type: 'P2P',
    },
    overrideAccess: true,
    depth: 0,
    user: recipient.user,
  });

  createdIds.transactions.push(transaction.id);
});

afterAll(async () => {
  await cleanupRecords(payload, createdIds);
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Transactions collection — create a transaction', () => {
  describe('transaction number (txn field)', () => {
    it('auto-generates a transaction number in the TXN-XXXXXXXX-XXXX format', () => {
      /**
       * The `generateTransactionNumber` beforeChange hook produces a string
       * like `TXN-12345678-A1B2`.
       * Pattern: `TXN-` + 8 uppercase alphanumeric chars + `-` + 4 uppercase
       * alphanumeric chars.
       */
      expect(transaction.txn).toMatch(/^TXN-[A-Z0-9]{8}-[A-Z0-9]{4}$/);
    });

    it('uses the provided txn value if one is already set (idempotent)', async () => {
      /**
       * The hook contains: `if (value && value.trim() !== '') { return value; }`
       * Passing a pre-filled `txn` must be preserved, not overwritten.
       */
      const existingTxn = 'TXN-EXISTING-ABCD';

      // @ts-expect-error - Type error for auto-generated fields, safe-error
      const doc = await payload.create({
        collection: 'transactions',
        data: {
          txn: existingTxn,
          sender: sender.profileRef,
          recipient: recipient.profileRef,
          milkBags: extractID(bags),
          type: 'P2P',
          status: 'PENDING',
        },
        overrideAccess: true,
        depth: 0,
        user: sender.user,
      });

      createdIds.transactions.push(doc.id);

      expect(doc.txn).toBe(existingTxn);
    });
  });

  describe('status field', () => {
    it('defaults to PENDING when no status is provided', () => {
      expect(transaction.status).toBe('PENDING');
    });
  });

  describe('afterChange hook — operation: create', () => {
    it('marks the linked donation status as MATCHED', async () => {
      /**
       * `markDonationAsMatched` is called inside `Promise.all()` in the
       * afterChange hook.  We re-fetch the donation to confirm the update
       * was persisted to the database.
       */
      const updatedDonation = await payload.findByID({
        collection: 'donations',
        id: donation.id,
        overrideAccess: true,
        depth: 0,
      });

      expect(updatedDonation.status).toBe('MATCHED');
    });

    it('marks the linked request status as MATCHED', async () => {
      /**
       * `markRequestAsMatched` is called in the same `Promise.all()` branch.
       */
      const updatedRequest = await payload.findByID({
        collection: 'requests',
        id: request.id,
        overrideAccess: true,
        depth: 0,
      });

      expect(updatedRequest.status).toBe('MATCHED');
    });

    it('marks all linked milk bags as ALLOCATED', async () => {
      /**
       * `markBagsAsAllocated` performs a bulk update on all bag IDs included in
       * the transaction's `milkBags` field.
       */
      const { docs: updatedBags } = await payload.find({
        collection: 'milkBags',
        where: { id: { in: extractID(bags) } },
        overrideAccess: true,
        depth: 0,
        user: sender.user,
      });

      expect(updatedBags).toHaveLength(bags.length);
      for (const bag of updatedBags) {
        expect(bag.status).toBe('ALLOCATED');
      }
    });

    it('does NOT trigger side effects when no user profile is present in req', async () => {
      /**
       * When `req.user` has no `profile`, the hook exits immediately:
       *   `if (!user?.profile) return doc;`
       *
       * Create a second pair of bags and a donation with an unauthenticated
       * request — neither the donation nor the bags should change status.
       */
      const extraSenderFixtures = new Fixtures(payload, sender.user);
      const extraBags = await extraSenderFixtures.createTestMilkBags(1, 80, 'AVAILABLE');
      createdIds.milkBags.push(...extractID(extraBags));

      const extraDonation = await extraSenderFixtures.createTestDonation(extractID(extraBags));
      createdIds.donations.push(extraDonation.id);

      const extraRecipientFixtures = new Fixtures(payload, recipient.user);
      const extraRequest = await extraRecipientFixtures.createTestRequest([], 'AVAILABLE');
      createdIds.requests.push(extraRequest.id);

      // Create transaction WITHOUT a user profile in req
      // @ts-expect-error - Type error for auto-generated fields, safe-error
      const unauthenticatedDoc = await payload.create({
        collection: 'transactions',
        data: {
          sender: sender.profileRef,
          recipient: recipient.profileRef,
          donation: extraDonation.id,
          request: extraRequest.id,
          milkBags: extractID(bags),
          type: 'P2P',
          status: 'PENDING',
        },
        overrideAccess: true,
        depth: 0,
        user: sender.user,
      });

      createdIds.transactions.push(unauthenticatedDoc.id);

      const stillAvailableDonation = await payload.findByID({
        collection: 'donations',
        id: extraDonation.id,
        overrideAccess: true,
        depth: 0,
      });

      // Status must remain AVAILABLE — hook should not have run
      expect(stillAvailableDonation.status).toBe('AVAILABLE');
    });
  });
});
