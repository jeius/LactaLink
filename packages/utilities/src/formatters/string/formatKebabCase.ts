/**
 * Converts a string to kebab-case.
 *
 * @param string - The string to convert.
 * @returns The kebab-cased string.
 *
 * @example
 * ```typescript
 * const result = toKebabCase('Kebab Case String');
 * console.log(result); // 'kebab-case-string'
 * ```
 */
export function toKebabCase(string: string): string {
  return string
    ?.replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

/**
 * Converts a kebab-case string to a title-cased string.
 *
 * @param str - The kebab-case string to format.
 * @returns The formatted string in title case.
 *
 * @example
 * ```typescript
 * const result = formatKebabToTitle('kebab-case-string');
 * console.log(result); // 'Kebab Case String'
 * ```
 */
export function formatKebabToTitle(str: string) {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Converts a kebab-case string to a space-separated string.
 *
 * @param str - The kebab-case string to format.
 * @returns The formatted string with spaces.
 *
 * @example
 * ```typescript
 * const result = formatKebab('kebab-case-string');
 * console.log(result); // 'kebab case string'
 * ```
 */
export function formatKebab(str: string) {
  return str.split('-').join(' ');
}
