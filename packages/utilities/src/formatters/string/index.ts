import { DAYS } from '@lactalink/enums';

export * from './formatCamelCase';
export * from './formatKebabCase';

/**
 * Removes trailing commas or whitespace from a street address.
 *
 * @param input - The street address to sanitize.
 * @returns The sanitized street address.
 *
 * @example
 * ```typescript
 * const address = sanitizeStreetAddress('123 Main St, ');
 * console.log(address); // '123 Main St'
 * ```
 */
export function sanitizeStreetAddress(input: string): string {
  return input.trim().replace(/[,|\s]+$/, '');
}

/**
 * Capitalizes the first letter of every word in a string.
 *
 * @param str - The string to capitalize.
 * @returns The string with each word capitalized.
 *
 * @example
 * ```typescript
 * const result = capitalizeAll('hello world');
 * console.log(result); // 'Hello World'
 * ```
 */
export function capitalizeAll(str: string) {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Capitalizes the first letter of a string.
 *
 * @param str - The string to capitalize.
 * @returns The string with the first letter capitalized.
 *
 * @example
 * ```typescript
 * const result = capitalizeFirst('hello');
 * console.log(result); // 'Hello'
 * ```
 */
export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Ensures that a string ends with a period.
 *
 * @param str - The string to check.
 * @returns The string with a period appended if it doesn't already end with one.
 *
 * @example
 * ```typescript
 * const result = ensureEndsWithDot('Hello');
 * console.log(result); // 'Hello.'
 * ```
 */
export function ensureEndsWithDot(str?: string | null) {
  if (!str) return str;
  return str.endsWith('.') ? str : `${str}.`;
}

/**
 * Checks if a string starts with any of the provided prefixes.
 *
 * @template T - The type of the prefixes (string, array of strings, or object with string values).
 * @param value - The string to check.
 * @param prefixes - The prefixes to check against (string, array, or object).
 * @returns `true` if the string starts with any of the prefixes, otherwise `false`.
 *
 * @example
 * ```typescript
 * const result = isStartsWith('hello', ['he', 'hi']);
 * console.log(result); // true
 * ```
 */
export function isStartsWith<T extends string | string[] | Record<string, string>>(
  value: string,
  prefixes: T
): boolean {
  const baseList =
    typeof prefixes === 'string'
      ? [prefixes]
      : Array.isArray(prefixes)
        ? prefixes
        : Object.values(prefixes);

  return baseList.some((base) => value.startsWith(base));
}

export function formatDaysToText(days: (keyof typeof DAYS)[]): string {
  if (days.length === 0) return 'No days specified';
  if (days.length === 7) return 'Any day';

  return days.map((day) => DAYS[day].label).join(',');
}
