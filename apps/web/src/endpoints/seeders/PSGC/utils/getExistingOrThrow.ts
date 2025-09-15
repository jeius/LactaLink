import { CollectionPSGC, ExistingDocs, RawPSGCData } from '@lactalink/types/psgc';
import { status } from 'http-status';
import { APIError } from 'payload';

type CollectionId<T extends RawPSGCData | boolean> = T extends RawPSGCData
  ? CollectionPSGC['id']
  : T extends boolean
    ? undefined
    : never;

type KeyType<T extends RawPSGCData | boolean> = T extends RawPSGCData ? T['code'] : boolean;

export function getExistingOrThrow<T extends RawPSGCData | boolean = RawPSGCData>(
  map: ExistingDocs,
  key: KeyType<T>,
  label: string,
  collectionLabel: string
): CollectionId<T> {
  // Return an empty value if the key is a boolean
  if (typeof key === 'boolean') {
    console.warn(
      `Warning: Key is a boolean (${key}). Returning an empty id for ${label} in ${collectionLabel}.`
    );
    return undefined as CollectionId<T>;
  }

  // Retrieve the value from the map
  const value = map.get(key);

  // Throw an error if the value does not exist
  if (!value) {
    throw new APIError(`Missing ${label} for ${collectionLabel} ${key}.`, status.NOT_FOUND);
  }

  // Return the value
  return value as CollectionId<T>;
}
