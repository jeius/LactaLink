/**
 * @module fixtures
 *
 * Factory functions for seeding and cleaning up test data in the integration
 * test suite.
 *
 * ## Design principles
 *
 * 1. **Deterministic IDs** — every factory accepts an optional `id` parameter
 *    and uses `crypto.randomUUID()` when one is not given.  Callers that store
 *    the returned document can always retrieve its `id` for later assertions or
 *    cleanup, without having to predict what the database will assign.
 *
 * 2. **Unauthenticated requests for seeds** — factories pass a req object with
 *    `user: null` to the Payload Local API.  This causes any hook that starts
 *    with `if (!user?.profile) return doc;` to exit early, which avoids
 *    cascading side effects (notifications, search indexing, etc.) when
 *    creating prerequisite records that are not themselves under test.
 *
 * 3. **Orderly cleanup** — `cleanupRecords` deletes records in reverse
 *    dependency order (allocations → transactions → requests → donations →
 *    milk bags → profiles → users).  This prevents foreign-key / reference
 *    violations that would otherwise turn `afterAll` into a source of noise.
 */

import type {
  Donation,
  Individual,
  InventoryAllocation,
  MilkBag,
  Request,
  Transaction,
  User,
} from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { randomUUID } from 'crypto';
import type { BasePayload, Payload } from 'payload';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TestUser {
  user: User;
  profile: Individual;
  /** Pre-built `profile` reference in the shape Payload stores on `User.profile` */
  profileRef: { relationTo: 'individuals'; value: string };
}

export class Fixtures {
  constructor(
    public payload: BasePayload,
    private user: User
  ) {}

  getUser() {
    return this.user;
  }

  /**
   * Creates milk bags owned by the current user.
   *
   * @param count          - Number of bags to create (default 2).
   * @param volumePerBag   - Volume in ml for each bag (default 100).
   * @param status         - Initial bag status (default `'AVAILABLE'`).  Pass
   *                         `'ALLOCATED'` when seeding the "complete transaction"
   *                         test which expects `consumeMilkBags` to consume them.
   */
  async createTestMilkBags(
    count = 2,
    volumePerBag = 100,
    status: MilkBag['status'] = 'AVAILABLE'
  ): Promise<MilkBag[]> {
    const payload = this.payload;
    const user = this.user;
    const bags: MilkBag[] = [];

    for (let i = 0; i < count; i++) {
      // @ts-expect-error - Type error for auto-generated fields, safe-error
      const bag = await payload.create({
        collection: 'milkBags',
        data: {
          donor: extractID(user.profile?.value),
          volume: volumePerBag,
          status,
          collectedAt: new Date().toISOString(),
        },
        overrideAccess: true,
        depth: 0,
        user: user,
      });

      bags.push(bag);
    }

    return bags;
  }

  /**
   * Creates a minimal `donations` record with `AVAILABLE` status containing the
   * provided milk bags.
   *
   * @param milkBagIds      - Array of milk bag IDs to include in `details.bags`.
   * @param recipient       - Optional donation recipient.
   * @param status          - Initial donation status (default `'AVAILABLE'`).
   */
  async createTestDonation(
    milkBagIds: string[],
    recipient?: Donation['recipient'],
    status: Donation['status'] = 'AVAILABLE'
  ): Promise<Donation> {
    const payload = this.payload;
    const user = this.user;

    // @ts-expect-error - Type error for auto-generated fields, safe-error
    return await payload.create({
      collection: 'donations',
      data: {
        donor: extractID(user.profile?.value),
        recipient: recipient,
        status: status,
        details: {
          storageType: 'FRESH',
          collectionMode: 'MANUAL',
          bags: milkBagIds,
        },
      },
      overrideAccess: true,
      depth: 0,
      user: user,
    });
  }

  /**
   * Creates a minimal `requests` record with `AVAILABLE` status.
   *
   * @param milkBagIds        - Bag IDs pre-allocated to the request (for
   *                            `details.bags`).  Pass an empty array for
   *                            "create transaction" tests where no bags are
   *                            pre-assigned to the request yet.
   * @param status            - Initial request status (default `'AVAILABLE'`).
   * @param volumeNeeded      - Initial `volumeNeeded` value (default 200 mL).
   * @param recipient         - Optional request recipient.
   */
  async createTestRequest(
    milkBagIds: string[] = [],
    status: Request['status'] = 'AVAILABLE',
    volumeNeeded = 200,
    recipient?: Request['recipient']
  ): Promise<Request> {
    const payload = this.payload;
    const user = this.user;

    // @ts-expect-error - Type error for auto-generated fields, safe-error
    return await payload.create({
      collection: 'requests',
      data: {
        requester: extractID(user.profile?.value),
        recipient: recipient,
        status: status,
        initialVolumeNeeded: volumeNeeded,
        volumeNeeded: volumeNeeded,
        volumeFulfilled: 0,
        details: {
          neededAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          urgency: 'LOW',
          bags: milkBagIds,
        },
      },
      overrideAccess: true,
      depth: 0,
      user: user,
    });
  }

  /**
   * Used by the "complete" test suite to seed a transaction in a known state
   * (e.g. `CONFIRMED`) before testing the status-change side effects.  Seeding
   * through `payload.create` with an unauthenticated request causes the hook to
   * exit at `if (!user?.profile) return doc;`, which is exactly what we want —
   * we do NOT want `markDonationAsMatched` etc. to run during test setup.
   *
   * @param senderProfileId - `individuals` ID for `sender` and `initiatedBy`.
   * @param recipientProfileId - `individuals` ID for `recipient`.
   * @param milkBagIds      - Bag IDs for `milkBags`.
   * @param donationId      - ID of the linked donation (can be null for headless tests).
   * @param requestId       - ID of the linked request (can be null for headless tests).
   * @param status          - Initial transaction status (defaults to `'CONFIRMED'`).
   */
  async createTestTransaction(
    senderProfileId: string,
    recipientProfileId: string,
    milkBagIds: string[],
    donationId: string | null = null,
    requestId: string | null = null,
    status: Transaction['status'] = 'CONFIRMED'
  ): Promise<Transaction> {
    const payload = this.payload;
    const user = this.user;

    // @ts-expect-error - Type error for auto-generated fields, safe-error
    return await payload.create({
      collection: 'transactions',
      data: {
        sender: { relationTo: 'individuals', value: senderProfileId },
        recipient: { relationTo: 'individuals', value: recipientProfileId },
        donation: donationId,
        request: requestId,
        milkBags: milkBagIds,
        status,
        type: 'P2P',
      },
      overrideAccess: true,
      depth: 0,
      user: user,
    });
  }

  /**
   * Creates a minimal `hospitals` record — only `name` is required.
   *
   * @param name    - Hospital name (defaults to a generated string).
   */
  async createTestHospital(name = `Test Hospital ${randomUUID().slice(0, 6)}`) {
    const payload = this.payload;
    const user = this.user;

    return payload.create({
      collection: 'hospitals',
      data: { name },
      overrideAccess: true,
      depth: 0,
      user: user,
    });
  }

  /**
   * Creates a minimal `inventories` record linked to a hospital.
   *
   * @param hospitalId   - ID of the owning hospital.
   * @param milkBagIds   - Bags to include in the inventory.
   * @param donationId   - Optional source donation (can be omitted for unit tests).
   */
  async createTestInventory(hospitalId: string, milkBagIds: string[] = [], donationId?: string) {
    const payload = this.payload;
    const user = this.user;

    if (donationId) {
      // @ts-expect-error - Type error for auto-generated fields, safe-error
      return payload.create({
        collection: 'inventories',
        data: {
          organization: { relationTo: 'hospitals', value: hospitalId },
          sourceDonation: donationId,
          status: 'AVAILABLE',
        },
        overrideAccess: true,
        depth: 0,
        user: user,
      });
    }

    // @ts-expect-error - Type error for auto-generated fields, safe-error
    const inventory = await payload.create({
      collection: 'inventories',
      data: {
        organization: { relationTo: 'hospitals', value: hospitalId },
        status: 'AVAILABLE',
      },
      overrideAccess: true,
      depth: 0,
    });

    await payload.update({
      collection: 'milkBags',
      where: { id: { in: milkBagIds } },
      data: { inventory: inventory.id },
      overrideAccess: true,
      depth: 0,
      user: user,
    });

    return inventory;
  }

  /**
   * Creates a `PENDING` inventory allocation linking an inventory pool to a
   * request.  Used to verify that `markRequestAsComplete` transitions matching
   * allocations to `FULFILLED`.
   *
   * **Cascade hook suppressed during seeding** — the `InventoryAllocations`
   * `afterChange` hook checks `req.context.skipInventoryAllocation` to avoid
   * re-entrant loops.  We exploit the same flag here so that creating the seed
   * allocation does not cascade `remainingVolume` updates or re-mark milk bags
   * to ALLOCATED, which would interfere with the test's initial state.
   *
   * @param inventoryId  - ID of the parent inventory record.
   * @param requestId    - ID of the request being fulfilled.
   * @param milkBagIds   - Bags allocated to this record.
   */
  async createTestInventoryAllocation(
    inventoryId: string,
    requestId: string,
    milkBagIds: string[]
  ): Promise<InventoryAllocation> {
    const payload = this.payload;
    const user = this.user;

    // @ts-expect-error - Type error for auto-generated fields, safe-error
    return await payload.create({
      collection: 'inventory-allocations',
      data: {
        inventory: inventoryId,
        request: requestId,
        allocatedBags: milkBagIds,
        status: 'PENDING',
        allocatedAt: new Date().toISOString(),
      },
      overrideAccess: true,
      depth: 0,
      user: user,
    });
  }
}

// ---------------------------------------------------------------------------
// Users & Profiles
// ---------------------------------------------------------------------------

/**
 * Creates a minimal `users` document and a linked `individuals` profile.
 *
 * The user's `profile` field is updated after the individual is created so
 * that `req.user.profile` resolves correctly inside collection hooks.
 *
 * @param payload - The active Payload instance.
 * @param overrides - Optional field overrides for the user document.
 */
export async function createTestUser(
  payload: Payload,
  overrides: Partial<{ email: string; role: User['role']; name: string }> = {}
): Promise<TestUser> {
  const email = overrides.email ?? `test-${randomUUID().slice(0, 5)}@lactalink.com`;
  const name = overrides.name ?? `User ${randomUUID().slice(0, 4)}`;

  // 1. Create the user
  const user = await payload.create({
    collection: 'users',
    data: { email, role: overrides.role ?? 'AUTHENTICATED' },
    overrideAccess: true,
    depth: 0,
  });

  // 2. Create the individual profile first (no reference to user needed)
  const profile = (await payload.create({
    collection: 'individuals',
    data: {
      givenName: name,
      familyName: 'Test',
      birth: '1990-01-01T00:00:00.000Z',
      gender: 'FEMALE',
      maritalStatus: 'SINGLE',
      owner: user.id,
    },
    depth: 0,
    overrideAccess: true,
    user: user,
  })) as Individual;

  // 3. Get the updated user
  const updatedUser = await payload.findByID({
    collection: 'users',
    id: user.id,
    overrideAccess: true,
    depth: 1,
    user: user,
  });

  return {
    user: updatedUser,
    profile,
    profileRef: { relationTo: 'individuals', value: profile.id },
  };
}

/**
 * Fetches the admin user specified by `ADMIN_EMAIL` in `.env.test` (or a default
 * email if the env var is not set).
 *
 * @param payload - The active Payload instance.
 * @returns The admin user document.
 *
 * @throws `Error` if no user is found with the specified email.
 */
export async function getAdminUser(payload: BasePayload): Promise<User> {
  const defaultEmail = 'admin@gmail.com';
  const { docs } = await payload.find({
    collection: 'users',
    where: { email: { equals: process.env.ADMIN_EMAIL || defaultEmail } },
    depth: 0,
    limit: 1,
  });

  if (docs.length === 0) {
    throw new Error(
      `Admin user with email ${process.env.ADMIN_EMAIL || defaultEmail} not found. 
       Please ensure the admin user exists in the test database.`
    );
  }

  return docs[0]!;
}

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------

/**
 * IDs of records to delete, grouped by collection slug.
 *
 * Supply as many or as few as needed — unknown IDs are ignored.
 */
export interface CleanupMap {
  'inventory-allocations'?: string[];
  transactions?: string[];
  'transaction-status-histories'?: string[];
  requests?: string[];
  donations?: string[];
  milkBags?: string[];
  inventories?: string[];
  individuals?: string[];
  hospitals?: string[];
  users?: string[];
}

/**
 * Deletes all seeded test records from the database in reverse dependency order
 * to avoid FK / reference constraint violations.
 *
 * Errors during individual deletes are swallowed so that test cleanup is
 * best-effort — a partially-failing cleanup should not mask the actual test
 * failure.
 *
 * @param payload - The active Payload instance.
 * @param map     - Map of collection slug → array of IDs to delete.
 */
export async function cleanupRecords(payload: BasePayload, map: CleanupMap): Promise<void> {
  const ORDER: Array<keyof CleanupMap> = [
    'inventory-allocations',
    'transaction-status-histories',
    'transactions',
    'requests',
    'donations',
    'milkBags',
    'inventories',
    'individuals',
    'hospitals',
    'users',
  ];

  for (const slug of ORDER) {
    const ids = map[slug];
    if (!ids || ids.length === 0) continue;

    await Promise.allSettled(
      ids.map((id) =>
        payload.delete({
          collection: slug,
          id,
          overrideAccess: true,
          depth: 0,
        })
      )
    );
  }
}
