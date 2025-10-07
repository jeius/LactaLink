import { Collection } from '@lactalink/types/collections';

type ExcludedValue = string | number | undefined | null;
type CollectionObject<T> = T extends (ExcludedValue | Collection)[]
  ? Exclude<NonNullable<T[number]>, ExcludedValue>[]
  : T extends ExcludedValue | Collection
    ? Exclude<NonNullable<T>, ExcludedValue> | null
    : never;

type Object<T> = T extends (ExcludedValue | object)[]
  ? Exclude<NonNullable<T[number]>, ExcludedValue>[]
  : T extends ExcludedValue | object
    ? Exclude<NonNullable<T>, ExcludedValue> | null
    : never;

/**
 * Extracts the collection object or array of collection objects from a value, excluding strings and numbers.
 * If the value is an array, it filters out any strings or numbers.
 *
 * @param value - The value to extract the collection from.
 * @returns A collection object or null if the value is not a valid collection.
 */
export function extractCollection<T>(value: T): CollectionObject<T> {
  function isValidObject<T>(val: T): boolean {
    return val !== null && val !== undefined && typeof val !== 'string' && typeof val !== 'number';
  }

  if (Array.isArray(value)) {
    return value.filter((v) => isValidObject(v)) as CollectionObject<T>;
  } else if (isValidObject(value)) {
    return value as CollectionObject<T>;
  }
  return null as CollectionObject<T>;
}

/**
 * Extracts the object or array of objects from a value, excluding strings and numbers.
 * @param value - The value to extract the object from.
 * @returns A collection object or null if the value is not a valid object.
 */
export function extractObject<T>(value: T): Object<T> {
  function isValidObject<T>(val: T): boolean {
    return val !== null && val !== undefined && typeof val !== 'string' && typeof val !== 'number';
  }

  if (Array.isArray(value)) {
    return value.filter((v) => isValidObject(v)) as Object<T>;
  } else if (isValidObject(value)) {
    return value as Object<T>;
  }
  return null as Object<T>;
}
