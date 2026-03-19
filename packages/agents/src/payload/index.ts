/**
 * @lactalink/agents/payload
 *
 * Reusable TypeScript runtime utilities for PayloadCMS hooks, access control,
 * and local API operations. Import in apps/web via `@lactalink/agents/payload`.
 */

import type { CollectionSlug, PayloadRequest, Where } from 'payload';
import { getHookContext, setHookContext } from './hookContext';

export * from './fieldValidators';
export * from './hookContext';
export * from './HookDepthTracker';

// ---------------------------------------------------------------------------
// Local API helpers — typed wrappers around req.payload
// See: .agents/skills/payload/reference/QUERIES.md
// ---------------------------------------------------------------------------

/**
 * Finds a single document by a where clause. Returns `null` when not found
 * instead of throwing, making it safe to use inside hooks.
 *
 * Supply your generated document type as the second generic for full type safety:
 * @example
 * import type { User } from '@lactalink/types/payload-generated-types';
 * const donor = await findOne<'users', User>(req, 'users', { id: { equals: doc.donor } });
 */
export async function findOne<TSlug extends CollectionSlug, TDoc = Record<string, unknown>>(
  req: PayloadRequest,
  collection: TSlug,
  where: Where
): Promise<TDoc | null> {
  const result = await req.payload.find({
    collection,
    where,
    limit: 1,
    depth: 0,
    req,
    overrideAccess: false,
  });
  return (result.docs[0] as TDoc | undefined) ?? null;
}

// ---------------------------------------------------------------------------
// Access control builders — compose Where-based access rules
// See: .agents/skills/payload/reference/ACCESS-CONTROL.md
// ---------------------------------------------------------------------------

/**
 * Returns a Payload `Where` clause restricting results to documents owned by
 * the current user, identified by `field` (defaults to `"createdBy"`).
 *
 * @example
 * export const myAccess: Access = ({ req }) => ownedBy(req) ?? false;
 */
export function ownedBy(req: PayloadRequest, field = 'createdBy'): Where | false {
  if (!req.user) return false;
  return { [field]: { equals: req.user.id } };
}

// ---------------------------------------------------------------------------
// Hook logger — consistent error/info logging pattern used across collections
// ---------------------------------------------------------------------------

/**
 * Returns a scoped logger bound to a collection + operation label, mirroring
 * the `req.payload.logger` calls already used throughout the collections.
 *
 * @param req - The Payload request object, used to access the logger instance.
 * @param collection - The slug of the collection for which the logger is being created.
 * @param hook - The name of the hook or operation for which the logger is being created.
 * @param logCount - Number of times this log repeats in the single request.
 * Used to prevent logging on recursive hooks. Defaults to 1 (no repetition).
 *
 * @example
 * const log = hookLogger(req, 'donations', 'afterChange');
 *
 * log.info(`Processed donation ${doc.id}`);
 * // Logs: [donations:afterChange] Processed donation 12345
 *
 * log.error(err, 'Failed to send notification');
 * // Logs: [donations:afterChange] Failed to send notification - Error details...
 *
 * // In a recursive hook, you might set `logCount` to 1 to only log the first occurrence
 * // of the same message:
 * const log = hookLogger(req, 'milkBags', 'beforeRead', 1);
 * log.info(`Checking expiry for milk bag ${doc.id}`);
 * checkExpiry(doc);
 * // This will trigger the beforeRead hook on the doc which may update the status to EXPIRED
 * // and cause another beforeRead call on the same doc. With `logCount` set to 1, only the first
 * // log will be printed, preventing infinite logging loops.
 *
 */
export function hookLogger(
  req: PayloadRequest,
  collection: string,
  hook: string,
  logCount: number = 1
) {
  const contextKey = 'hookLoggerCount';
  const countsMap = new Map(getHookContext<Map<string, number>>(req, contextKey));
  const prefix = `[${collection}:${hook}]`;

  const trackLogCount = (key: string) => {
    const currentCount = countsMap.get(key) ?? 0;
    countsMap.set(key, currentCount + 1);
    setHookContext(req, contextKey, countsMap);
  };

  const shouldLog = (key: string) => {
    const currentCount = countsMap.get(key) ?? 0;
    return currentCount <= logCount;
  };

  function info(msg: string, data?: unknown) {
    const logKey = `${prefix}:${msg}`;
    if (!shouldLog(logKey)) return;
    trackLogCount(logKey);
    req.payload.logger.info(data, `${prefix} ${msg}`);
  }

  function warn(msg: string, data?: unknown) {
    const logKey = `${prefix}:${msg}`;
    if (!shouldLog(logKey)) return;
    trackLogCount(logKey);
    req.payload.logger.warn(data, `${prefix} ${msg}`);
  }

  function error(err: unknown, msg: string) {
    const logKey = `${prefix}:${msg}`;
    if (!shouldLog(logKey)) return;
    trackLogCount(logKey);
    req.payload.logger.error(err, `${prefix} ${msg}`);
  }

  return { info, warn, error };
}

// ---------------------------------------------------------------------------
// Transaction helper — thread req through multi-step operations atomically
// See: .agents/skills/payload/reference/ADAPTERS.md#threading-req-through-operations
// ---------------------------------------------------------------------------

/**
 * Runs `fn` inside a Payload transaction. On failure, the transaction is
 * rolled back automatically. Pass `req` through to every payload operation
 * inside `fn` so they all join the same transaction.
 *
 * @example
 * await withTransaction(req, async (txReq) => {
 *   await txReq.payload.update({ collection: 'donations', id, data, req: txReq });
 *   await txReq.payload.create({ collection: 'inventory', data, req: txReq });
 * });
 */
export async function withTransaction<T>(
  req: PayloadRequest,
  fn: (req: PayloadRequest) => Promise<T>
): Promise<T> {
  const id = await req.payload.db.beginTransaction?.();
  if (!id) return fn(req);
  try {
    const result = await fn({ ...req, transactionID: id });
    await req.payload.db.commitTransaction?.(id);
    return result;
  } catch (err) {
    await req.payload.db.rollbackTransaction?.(id);
    throw err;
  }
}
