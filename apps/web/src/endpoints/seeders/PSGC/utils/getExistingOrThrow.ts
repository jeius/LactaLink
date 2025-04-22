import { status } from 'http-status';
import { APIError } from 'payload';

/**
 * Retrieves a value from a map by its key or throws an error if the key does not exist.
 *
 * @template T - The type of the value stored in the map.
 *
 * @param {Record<string, T>} map - The map containing key-value pairs.
 * @param {string | boolean} key - The key to look up in the map. If the key is a boolean, it returns an empty value.
 * @param {string} label - A descriptive label for the missing value (used in the error message).
 * @param {string} collectionLabel - A label for the collection being processed (used in the error message).
 * @returns {T} - The value associated with the key in the map.
 *
 * @throws {APIError} - Throws an error if the key does not exist in the map.
 *
 * @description
 * This utility function is used to ensure that a required value exists in a map. If the key is not found,
 * it throws an `APIError` with a descriptive message and a `NOT_FOUND` status code.
 *
 * @example
 * const map = { region1: 'Region 1', region2: 'Region 2' };
 * const value = getExistingOrThrow(map, 'region1', 'Region', 'Regions');
 * console.log(value); // 'Region 1'
 *
 * // Throws an error:
 * getExistingOrThrow(map, 'region3', 'Region', 'Regions');
 */
export function getExistingOrThrow<T>(
  map: Record<string, T>,
  key: string | boolean,
  label: string,
  collectionLabel: string
): T {
  // Return an empty value if the key is a boolean
  if (typeof key === 'boolean') return '' as T;

  // Retrieve the value from the map
  const value = map[key];

  // Throw an error if the value does not exist
  if (!value) {
    throw new APIError(`Missing ${label} for ${collectionLabel} ${key}.`, status.NOT_FOUND);
  }

  // Return the value
  return value;
}
