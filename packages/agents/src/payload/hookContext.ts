// ---------------------------------------------------------------------------
// Hook context guards — prevent hook loops (req.context pattern)
// See: .agents/skills/payload/reference/HOOKS.md#hook-context
// ---------------------------------------------------------------------------

import { PayloadRequest } from 'payload';

/**
 * Returns true if a named hook has already been marked as run on this request,
 * preventing accidental recursive/looping hook execution.
 *
 * @example
 * if (isHookRun(req, 'generateTitle')) return doc;
 * markHookRun(req, 'generateTitle');
 */
export function isHookRun(req: PayloadRequest, hookName: string): boolean {
  return Boolean(req.context?.[hookName]);
}

/**
 * Marks a named hook as run for the lifetime of this request.
 */
export function markHookRun(req: PayloadRequest, hookName: string): void {
  if (!req.context) req.context = {};
  req.context[hookName] = true;
}

/**
 * Clears a named hook run flag from the request context, allowing the hook to run again
 * later in the same request if needed. Useful for complex operations that may need to
 * temporarily bypass the `isHookRun()` check.
 * @example
 * // In a hook that needs to call another hook which also checks for "isHookRun":
 * markHookRun(req, 'outerHook');
 * await someOperationThatTriggersInnerHook();
 * clearHookRun(req, 'outerHook'); // Allow innerHook to run if it checks for 'outerHook'
 */
export function clearHookRun(req: PayloadRequest, hookName: string): void {
  if (req.context) delete (req.context as Record<string, unknown>)[hookName];
}

/**
 * Sets an arbitrary key-value pair in the request context, which can be used to
 * share data across hooks and operations during the lifecycle of a request.
 * @example
 * setHookContext(req, 'currentUserRole', req.user?.role);
 * // Later in another hook or operation:
 * const role = getHookContext<string>(req, 'currentUserRole');
 */
export function setHookContext<T>(req: PayloadRequest, key: string, value: T): void {
  if (!req.context) req.context = {};
  req.context[key] = value;
}

/**
 * Retrieves a value from the request context by key, with optional type safety.
 * Returns `undefined` if the key does not exist in the context.
 * @example
 * const role = getHookContext<string>(req, 'currentUserRole');
 * if (role === 'admin') { ... }
 * const nonExistent = getHookContext(req, 'nonExistentKey'); // Type is unknown, value is undefined
 */
export function getHookContext<T>(req: PayloadRequest, key: string): T | undefined {
  return req.context ? (req.context[key] as T | undefined) : undefined;
}
