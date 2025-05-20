import type { CollectionSlug as SlugsFromPayload, Where as WherePayload } from 'payload';
import { Config } from './payload-types';

export type Collections = Config['collections'][keyof Config['collections']];
export type HasNameCollection<T extends Collections> = T extends { name: string } ? T : never;
export type HasUploadCollection<T extends Collections> = T extends { filename?: string | null }
  ? T
  : never;
export type CollectionSlug = SlugsFromPayload;
export type HasNameCollectionSlug = Omit<
  CollectionSlug,
  'users' | 'payload-locked-documents' | 'payload-preferences' | 'payload-migrations' | 'avatars'
>;
export type CollectionOperation = 'CREATE' | 'FIND' | 'UPDATE' | 'DELETE';
export type CollectionData<T> = Omit<T, 'id' | 'updatedAt' | 'createdAt' | 'sizes'> &
  //@ts-expect-error 'sizes' is for upload collections and most not be modified.
  Partial<Pick<T, 'id' | 'updatedAt' | 'createdAt' | 'sizes'>>;
export type CollectionUpdateData<T> = Partial<CollectionData<T>>;
export type CollectionOperationData<
  T = Collections,
  O extends CollectionOperation = 'FIND',
> = O extends 'CREATE'
  ? CollectionData<T>
  : O extends 'UPDATE'
    ? CollectionUpdateData<T>
    : undefined;

export type Where = WherePayload;

// Helper to decrement depth
type DecrementDepth = [never, 0, 1, 2, 3, 4, 5];
export type Select<T, Depth extends number = 2> = Depth extends 0
  ? boolean
  : T extends Array<infer U>
    ? Select<U, DecrementDepth[Depth]> | boolean
    : T extends object
      ? {
          [K in keyof T]?:
            | boolean
            | Select<T[K], DecrementDepth[Depth]>
            | Select<T[K], DecrementDepth[Depth]>[];
        }
      : boolean;

type NestedPopulate<T> = {
  [K in keyof T]?: boolean | NestedPopulate<T[K] extends Array<infer U> ? U : T[K]>;
};

export type Populate = {
  [K in keyof Config['collections']]?: NestedPopulate<Config['collections'][K]>;
};

type SortValue<T> = `${'' | '-'}${Extract<keyof T, string>}`;
export type Sort<T> = SortValue<T> | SortValue<T>[];
