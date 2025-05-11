/**
 * Extracts the `id` from an object or returns the value directly if it's a string.
 *
 * This utility function is designed to handle cases where the input can be an object
 * with an `id` property, a string, or `null/undefined`. It ensures that the `id` is
 * extracted if the input is an object, or the input is returned as-is if it's a string.
 *
 * @template T - The type of the object containing the `id` property.
 * @param value - The input value, which can be an object with an `id` property, a string, or `null/undefined`.
 * @returns The extracted `id` if the input is an object, the input string if it's already a string,
 *          or `null/undefined` if the input is `null/undefined`.
 *
 * @example
 * ```typescript
 * // Extracting `id` from an object
 * const obj = { id: '12345' };
 * const id = extractID(obj); // '12345'
 *
 * // Returning the string directly
 * const str = '67890';
 * const idFromString = extractID(str); // '67890'
 *
 * // Handling null/undefined
 * const nullValue = null;
 * const idFromNull = extractID(nullValue); // null
 * ```
 */
export function extractID<T extends { id: string | number }>(
  value?: T | string | null
): T['id'] | null | undefined {
  if (!value) return value;

  if (typeof value === 'object') {
    return value.id;
  }

  return value;
}
