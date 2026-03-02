/**
 * @lactalink/agents/payload
 *
 * Reusable TypeScript runtime utilities for PayloadCMS hooks, access control,
 * and local API operations. Import in apps/web via `@lactalink/agents/payload`.
 */

import type { CollectionSlug, PayloadRequest, Where } from 'payload';

// ---------------------------------------------------------------------------
// Hook context guards — prevent hook loops (req.context pattern)
// See: .agents/skills/payload/reference/HOOKS.md#hook-context
// ---------------------------------------------------------------------------

/**
 * Returns true if a named hook has already been marked as run on this request,
 * preventing accidental recursive/looping hook execution.
 *
 * @example
 * if (isHookRun(req, 'generateTitle')) return doc;
 * markHookRun(req, 'generateTitle');
 */
export function isHookRun(req: PayloadRequest, hookName: string): boolean {
  return Boolean((req.context as Record<string, unknown>)?.[hookName]);
}

/**
 * Marks a named hook as run for the lifetime of this request.
 */
export function markHookRun(req: PayloadRequest, hookName: string): void {
  if (!req.context) req.context = {};
  (req.context as Record<string, unknown>)[hookName] = true;
}

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
 * @example
 * const log = hookLogger(req, 'donations', 'afterChange');
 * log.info(`Processed donation ${doc.id}`);
 * log.error(err, 'Failed to send notification');
 */
export function hookLogger(req: PayloadRequest, collection: string, hook: string) {
  const prefix = `[${collection}:${hook}]`;
  return {
    info: (msg: string) => req.payload.logger.info(`${prefix} ${msg}`),
    warn: (msg: string) => req.payload.logger.warn(`${prefix} ${msg}`),
    error: (err: unknown, msg: string) => req.payload.logger.error(err, `${prefix} ${msg}`),
  };
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
