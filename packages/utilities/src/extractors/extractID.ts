type Value = string | number | { id: string | number } | null | undefined;

/**
 * A utility type that extracts the `id` property from an object or an array of objects.
 *
 * - If the input is an array of objects with an `id` property, it returns an array of `id` values.
 * - If the input is a single object with an `id` property, it returns the `id` value.
 * - If the input is a string or number, it returns the input as-is.
 *
 * @template T - The type of the input value.
 */
type ID<T> = T extends (infer U)[]
  ? U extends { id: infer IDType }
    ? IDType extends string
      ? string[]
      : IDType[]
    : U[]
  : T extends { id: infer IDType }
    ? IDType
    : T;

/**
 * Extracts the `id` property from an object or an array of objects.
 *
 * This utility function is designed to handle various input types:
 * - If the input is an array of objects with an `id` property, it returns an array of `id` values.
 * - If the input is a single object with an `id` property, it returns the `id` value.
 * - If the input is a string or number, it returns the input as-is.
 *
 * @template T - The type of the input value.
 * @param value - The input value, which can be an object, an array of objects, a string, or a number.
 * @returns The extracted `id` or the input value itself, depending on the input type.
 *
 * @example
 * ```typescript
 * // Example 1: Extracting IDs from an array of objects
 * const users = [{ id: '123' }, { id: '456' }];
 * const ids = extractID(users); // ['123', '456']
 *
 * // Example 2: Extracting an ID from a single object
 * const user = { id: '789' };
 * const id = extractID(user); // '789'
 *
 * // Example 3: Returning a string or number as-is
 * const str = 'example';
 * const result = extractID(str); // 'example'
 *
 * const num = 42;
 * const resultNum = extractID(num); // 42
 * ```
 */
export function extractID<T extends Value | Value[]>(value: T): ID<T> {
  if (Array.isArray(value)) {
    return value.map((item) => (item && typeof item === 'object' ? item.id : item)) as ID<T>;
  }

  if (value && typeof value === 'object') {
    return value.id as ID<T>;
  }

  return value as ID<T>;
}
