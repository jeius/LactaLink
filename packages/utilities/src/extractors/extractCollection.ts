/* eslint-disable @typescript-eslint/no-explicit-any */
import { Collection } from '@lactalink/types';

type Value = string | Collection | undefined | null;
type CollectionType<T extends Value | Value[]> = T extends Value[]
  ? Extract<NonNullable<T[number]>, Collection>[]
  : T extends Value
    ? Extract<NonNullable<T>, Collection> | null
    : never;

/**
 * Extracts a single Collection or an array of Collections from a value.
 * @param value - The value to extract from, can be a Collection, an array of Collections, or undefined/null.
 * @returns A Collection, an array of Collections, or null if no valid Collection is found
 */
export function extractCollection<T extends Value | Value[]>(value: T): CollectionType<T> {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === 'object' && 'id' in value) as any;
  } else if (value && typeof value === 'object' && 'id' in value) {
    return value as any;
  }
  return null as any;
}
