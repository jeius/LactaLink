/**
 * Splits a camelCase or PascalCase string into space-separated words,
 * handling consecutive uppercase acronyms (e.g. `"parseHTMLContent"`) and
 * digits adjacent to letters (e.g. `"version2Update"`).
 *
 * @param str - The camelCase string to split.
 * @returns The string with spaces inserted between words.
 */
function splitCamelCase(str: string): string {
  return str
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // "HTMLParser" → "HTML Parser"
    .replace(/([a-z\d])([A-Z])/g, '$1 $2'); // "camelCase" → "camel Case", "version2Update" → "version2 Update"
}

/**
 * Converts a camelCase string to a space-separated lowercase string.
 * Handles consecutive uppercase acronyms and digits adjacent to letters.
 *
 * @param str - The camelCase string to format.
 * @returns The formatted string in lowercase with spaces.
 *
 * @example
 * ```typescript
 * formatCamelCase('camelCaseString'); // 'camel case string'
 * formatCamelCase('parseHTMLContent'); // 'parse html content'
 * formatCamelCase('version2Update'); // 'version2 update'
 * ```
 */
export function formatCamelCase(str: string): string {
  return splitCamelCase(str).toLowerCase();
}

/**
 * Converts a camelCase string to a space-separated string with the first letter capitalized.
 * Handles consecutive uppercase acronyms and digits adjacent to letters.
 *
 * @param str - The camelCase string to format.
 * @returns The formatted string with the first letter capitalized and the rest lowercased.
 *
 * @example
 * ```typescript
 * formatCamelCaseCaps('camelCaseString'); // 'Camel case string'
 * formatCamelCaseCaps('parseHTMLContent'); // 'Parse html content'
 * ```
 */
export function formatCamelCaseCaps(str: string): string {
  const lower = splitCamelCase(str).toLowerCase();
  return lower.replace(/^./, (char) => char.toUpperCase());
}

/**
 * Converts a camelCase string to a title-cased string.
 * Handles consecutive uppercase acronyms and digits adjacent to letters.
 *
 * @param str - The camelCase string to format.
 * @returns The formatted string in title case.
 *
 * @example
 * ```typescript
 * formatCamelCaseAllCaps('camelCaseString'); // 'Camel Case String'
 * formatCamelCaseAllCaps('parseHTMLContent'); // 'Parse Html Content'
 * ```
 */
export function formatCamelCaseAllCaps(str: string): string {
  return splitCamelCase(str)
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Converts a delimited string (space, hyphen, underscore, or mixed whitespace)
 * to camelCase. Handles `SCREAMING_SNAKE_CASE`, leading/trailing delimiters,
 * and multiple consecutive delimiters. Strings without delimiters are returned
 * with only the first character lowercased (preserving existing camelCase).
 *
 * @param str - The string to convert to camelCase.
 * @returns The camelCase version of the input string.
 *
 * @example
 * ```typescript
 * toCamelCase('Hello World'); // 'helloWorld'
 * toCamelCase('hello_world'); // 'helloWorld'
 * toCamelCase('HELLO_WORLD'); // 'helloWorld'
 * toCamelCase('--hello--world--'); // 'helloWorld'
 * toCamelCase('helloWorld'); // 'helloWorld'
 * ```
 */
export function toCamelCase(str: string): string {
  if (!str) return '';
  const trimmed = str.trim();
  // No delimiters — only ensure the first character is lowercase to preserve existing camelCase
  if (!/[-_\s]/.test(trimmed)) {
    return trimmed.replace(/^[A-Z]/, (c) => c.toLowerCase());
  }
  return trimmed
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word, index) =>
      index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('');
}
