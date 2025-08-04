import type { CollectionSlug, GlobalSlug } from '../index.js';
import type { Document, SelectType, Sort, Where } from './collection';
import type { TypeWithID } from './config';

export type FindOneArgs = {
  collection: CollectionSlug;
  draftsEnabled?: boolean;
  locale?: string;
  select?: SelectType;
  where?: Where;
};
export type FindOne = <T extends TypeWithID>(args: FindOneArgs) => Promise<null | T>;
export type FindArgs = {
  collection: CollectionSlug;
  draftsEnabled?: boolean;
  /** Setting limit to 1 is equal to the previous Model.findOne(). Setting limit to 0 disables the limit */
  limit?: number;
  locale?: string;
  page?: number;
  pagination?: boolean;
  select?: SelectType;
  skip?: number;
  sort?: Sort;
  versions?: boolean;
  where?: Where;
};
export type Find = <T = TypeWithID>(args: FindArgs) => Promise<PaginatedDocs<T>>;
export type CountArgs = {
  collection: CollectionSlug;
  locale?: string;
  where?: Where;
};
export type Count = (args: CountArgs) => Promise<{
  totalDocs: number;
}>;
export type CountVersions = (args: CountArgs) => Promise<{
  totalDocs: number;
}>;
export type CountGlobalVersionArgs = {
  global: string;
  locale?: string;
  where?: Where;
};
export type CountGlobalVersions = (args: CountGlobalVersionArgs) => Promise<{
  totalDocs: number;
}>;
type BaseVersionArgs = {
  limit?: number;
  locale?: string;
  page?: number;
  pagination?: boolean;
  select?: SelectType;
  skip?: number;
  sort?: Sort;
  versions?: boolean;
  where?: Where;
};

export type FindGlobalVersionsArgs = {
  global: GlobalSlug;
} & BaseVersionArgs;
export type FindGlobalArgs = {
  locale?: string;
  select?: SelectType;
  slug: string;
  where?: Where;
};
export type UpdateGlobalVersionArgs<T = TypeWithID> = {
  global: GlobalSlug;
  locale?: string;
  /**
   * Additional database adapter specific options to pass to the query
   */
  options?: Record<string, unknown>;
  /**
   * If true, returns the updated documents
   *
   * @default true
   */
  returning?: boolean;
  select?: SelectType;
  versionData: T;
} & (
  | {
      id: number | string;
      where?: never;
    }
  | {
      id?: never;
      where: Where;
    }
);

export type FindGlobal = <T extends Record<string, unknown> = any>(
  args: FindGlobalArgs
) => Promise<T>;
export type CreateGlobalArgs<T extends Record<string, unknown> = any> = {
  data: T;
  /**
   * If true, returns the updated documents
   *
   * @default true
   */
  returning?: boolean;
  slug: string;
};
export type CreateGlobal = <T extends Record<string, unknown> = any>(
  args: CreateGlobalArgs<T>
) => Promise<T>;
export type UpdateGlobalArgs<T extends Record<string, unknown> = any> = {
  data: T;
  /**
   * Additional database adapter specific options to pass to the query
   */
  options?: Record<string, unknown>;
  /**
   * If true, returns the updated documents
   *
   * @default true
   */
  returning?: boolean;
  select?: SelectType;
  slug: string;
};
/**
 * @todo type as Promise<T | null> in 4.0
 */
export type UpdateGlobal = <T extends Record<string, unknown> = any>(
  args: UpdateGlobalArgs<T>
) => Promise<T>;
export type DeleteVersionsArgs = {
  collection?: CollectionSlug;
  globalSlug?: GlobalSlug;
  locale?: string;
  sort?: {
    [key: string]: string;
  };
  where: Where;
};
export type CreateVersionArgs<T = TypeWithID> = {
  autosave: boolean;
  collectionSlug: CollectionSlug;
  createdAt: string;
  /** ID of the parent document for which the version should be created for */
  parent: number | string;
  publishedLocale?: string;
  /**
   * If true, returns the updated documents
   *
   * @default true
   */
  returning?: boolean;
  select?: SelectType;
  snapshot?: true;
  updatedAt: string;
  versionData: T;
};

export type CreateArgs = {
  collection: CollectionSlug;
  data: Record<string, unknown>;
  draft?: boolean;
  locale?: string;
  /**
   * If true, returns the updated documents
   *
   * @default true
   */
  returning?: boolean;
  select?: SelectType;
};
export type Create = (args: CreateArgs) => Promise<Document>;
export type UpdateOneArgs = {
  collection: CollectionSlug;
  data: Record<string, unknown>;
  draft?: boolean;
  locale?: string;
  /**
   * Additional database adapter specific options to pass to the query
   */
  options?: Record<string, unknown>;
  /**
   * If true, returns the updated documents
   *
   * @default true
   */
  returning?: boolean;
  select?: SelectType;
} & (
  | {
      id: number | string;
      where?: never;
    }
  | {
      id?: never;
      where: Where;
    }
);
/**
 * @todo type as Promise<Document | null> in 4.0
 */
export type UpdateOne = (args: UpdateOneArgs) => Promise<Document>;
export type UpdateManyArgs = {
  collection: CollectionSlug;
  data: Record<string, unknown>;
  draft?: boolean;
  limit?: number;
  locale?: string;
  /**
   * Additional database adapter specific options to pass to the query
   */
  options?: Record<string, unknown>;
  /**
   * If true, returns the updated documents
   *
   * @default true
   */
  returning?: boolean;
  select?: SelectType;
  sort?: Sort;
  where: Where;
};
export type UpdateMany = (args: UpdateManyArgs) => Promise<Document[] | null>;
export type UpsertArgs = {
  collection: CollectionSlug;
  data: Record<string, unknown>;
  locale?: string;
  /**
   * If true, returns the updated documents
   *
   * @default true
   */
  returning?: boolean;
  select?: SelectType;
  where: Where;
};
export type Upsert = (args: UpsertArgs) => Promise<Document>;
export type DeleteOneArgs = {
  collection: CollectionSlug;
  /**
   * If true, returns the updated documents
   *
   * @default true
   */
  returning?: boolean;
  select?: SelectType;
  where: Where;
};
/**
 * @todo type as Promise<Document | null> in 4.0
 */
export type DeleteOne = (args: DeleteOneArgs) => Promise<Document>;
export type DeleteManyArgs = {
  collection: CollectionSlug;
  where: Where;
};
export type DeleteMany = (args: DeleteManyArgs) => Promise<void>;

export type PaginatedDocs<T = any> = {
  docs: T[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
  nextPage?: null | number | undefined;
  page?: number;
  pagingCounter: number;
  prevPage?: null | number | undefined;
  totalDocs: number;
  totalPages: number;
};
