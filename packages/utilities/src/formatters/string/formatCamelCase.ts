/**
 * Converts a camelCase string to a space-separated lowercase string.
 *
 * @param str - The camelCase string to format.
 * @returns The formatted string in lowercase with spaces.
 *
 * @example
 * ```typescript
 * const result = formatCamelCase('camelCaseString');
 * console.log(result); // 'camel case string'
 * ```
 */
export function formatCamelCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
}

/**
 * Converts a camelCase string to a space-separated string with the first letter capitalized.
 *
 * @param str - The camelCase string to format.
 * @returns The formatted string with the first letter capitalized.
 *
 * @example
 * ```typescript
 * const result = formatCamelCaseCaps('camelCaseString');
 * console.log(result); // 'Camel case string'
 * ```
 */
export function formatCamelCaseCaps(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (char) => char.toUpperCase());
}

/**
 * Converts a camelCase string to a title-cased string.
 *
 * @param str - The camelCase string to format.
 * @returns The formatted string in title case.
 *
 * @example
 * ```typescript
 * const result = formatCamelCaseAllCaps('camelCaseString');
 * console.log(result); // 'Camel Case String'
 * ```
 */
export function formatCamelCaseAllCaps(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
