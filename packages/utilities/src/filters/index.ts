/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Filters out undefined values from an object.
 * @param obj The object to filter.
 * @returns A new object with undefined values removed.
 */
export function filterUndefined<T extends Record<string, any>>(
  obj: T
): {
  [K in keyof T]: Exclude<T[K], undefined>;
} {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined)) as {
    [K in keyof T]: Exclude<T[K], undefined>;
  };
}
