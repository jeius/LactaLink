/**
 * @module getTestPayload
 *
 * Provides a singleton accessor for the Payload instance used across the
 * entire test suite.
 *
 * ## Why singleton
 *
 * Payload v3 is designed around a **module-level singleton** — calling
 * `getPayload()` a second time returns the same cached instance.  Opening a
 * fresh Payload instance per test file would create multiple connection pools
 * to the same database, exhaust the Postgres `max_connections` limit on a
 * Supabase free-tier plan, and leave orphaned connections after the tests
 * finish.
 *
 * Because `vitest.config.ts` sets `pool: 'forks'` with `singleFork: true`,
 * all test files share the same Node.js worker process and therefore the same
 * module cache.  This module's `_instance` variable is shared across every
 * test file, so `getTestPayload()` truly initialises Payload only once per
 * test run.
 *
 * ## Usage
 *
 * ```ts
 * import { getTestPayload } from '../../helpers/getTestPayload';
 *
 * let payload: Awaited<ReturnType<typeof getTestPayload>>;
 *
 * beforeAll(async () => {
 *   payload = await getTestPayload();
 * });
 * ```
 */

import type { BasePayload } from 'payload';
import { getPayload } from 'payload';
import payloadTestConfig from '../config/payloadTestConfig';

let _instance: BasePayload | null = null;

/**
 * Returns the shared Payload instance, initialising it on the first call.
 *
 * @throws If `DATABASE_URI` or `PAYLOAD_SECRET` env vars are not set — these
 *         should come from `.env.test`.
 */
export async function getTestPayload(): Promise<BasePayload> {
  if (!_instance) {
    _instance = await getPayload({ config: payloadTestConfig });
  }

  return _instance;
}
