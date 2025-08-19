import { DeepPartial } from 'react-hook-form';
import { Avatar, CollectionSlug, Config, User } from '../payload-types';
import { FilterUnion } from '../utils';

export type Collections = Config['collections'][keyof Config['collections']];

type CollectionBySlug<Slug extends CollectionSlug> = Config['collections'][Slug];

export type Collection<Slug extends CollectionSlug | unknown = unknown> =
  Slug extends CollectionSlug ? CollectionBySlug<Slug> : Collections;

export type CollectionWithOwner = Extract<
  Collection,
  {
    owner?: string | User | null;
  }
>;

export type CollectionWithAvatar = Extract<
  Collection,
  {
    avatar?: string | Avatar | null;
  }
>;

export type CollectionWithBlurHash = Extract<
  Collection,
  {
    blurHash?: string | null;
  }
>;

export type CollectionWithCreatedBy = Extract<
  Collection,
  {
    createdBy?: string | User | null;
  }
>;

export type FileCollection = FilterUnion<Collection, { filename?: string | null }>;

export type FileCollectionSlug = keyof Pick<
  Config['collections'],
  'avatars' | 'images' | 'milk-bag-images'
>;

export type CollectionOperation = 'CREATE' | 'FIND' | 'UPDATE' | 'DELETE';

export type CollectionData<T extends Collection> = Omit<
  T,
  'id' | 'updatedAt' | 'createdAt' | 'sizes'
> &
  Partial<Pick<T, 'id' | 'updatedAt' | 'createdAt'>>;

export type CollectionDataBySlug<Slug extends CollectionSlug> = CollectionData<Collection<Slug>>;

export type CollectionUpdateData<T extends Collection> = DeepPartial<CollectionData<T>>;

export type CollectionUpdateDataBySlug<Slug extends CollectionSlug> = CollectionUpdateData<
  Collection<Slug>
>;

export type CollectionOperationData<
  T extends Collection = Collection,
  O extends CollectionOperation = 'FIND',
> = O extends 'CREATE'
  ? CollectionData<T>
  : O extends 'UPDATE'
    ? CollectionUpdateData<T>
    : undefined;

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
