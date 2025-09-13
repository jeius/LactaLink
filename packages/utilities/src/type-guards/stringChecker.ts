/**
 * Imports the `Collection` type from `@lactalink/types`.
 * This type is used as part of the union type `StringOrCollection`.
 */
import type { Collection } from '@lactalink/types/collections';

/**
 * A union type that can either be a `string` or a `Collection`.
 */
type StringOrCollection = string | Collection;

/**
 * Checks if the given value is a string.
 *
 * @template T - A type that extends `StringOrCollection`.
 * @param value - The value to check, which can be of type `StringOrCollection`.
 * @returns `true` if the value is a string, otherwise `false`.
 *
 * @example
 * const value: StringOrCollection = 'Hello';
 * if (isString(value)) {
 *   console.log('Value is a string:', value); // Output: Value is a string: Hello
 * }
 */
export function isString<T extends StringOrCollection = StringOrCollection>(
  value: T | null | undefined
): boolean {
  return typeof value === 'string';
}

/**
 * Checks if all elements in the given array are strings.
 *
 * @template T - A type that extends `StringOrCollection`.
 * @param value - An array of values to check, where each value can be of type `StringOrCollection`.
 * @returns `true` if all elements in the array are strings, otherwise `false`.
 *
 * @example
 * const values: StringOrCollection[] = ['Hello', 'World'];
 * if (areStrings(values)) {
 *   console.log('All values are strings:', values); // Output: All values are strings: ['Hello', 'World']
 * }
 */
export function areStrings<T extends StringOrCollection = StringOrCollection>(
  value: T[] | null | undefined
): boolean {
  if (Array.isArray(value) && value.length > 0) {
    return value.every((item) => typeof item === 'string');
  }
  return false;
}
