import { DeepPartial } from 'react-hook-form';
import { CustomError } from './errors';
import type {
  JoinQuery,
  PopulateType,
  Sort,
  TransformCollectionWithSelect,
  Where,
} from './payload-types/collection';
import type {
  BulkOperationResult,
  CollectionSlug,
  DataFromCollectionSlug,
  RequiredDataFromCollectionSlug,
  SelectFromCollectionSlug,
  TypedCollection,
  TypedLocale,
} from './payload-types/config';
import type { PaginatedDocs } from './payload-types/database';

//#region API Types
export type ApiFetchResponse<T> =
  | {
      message: string;
      data: T;
      status?: number;
    }
  | {
      message: string;
      error: CustomError | unknown;
      status?: number;
    };
export type ApiMethod = 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT';

export type BaseApiFetchArgs = {
  url: URL | string;
  token?: string | null;
  bypassToken?: string;
  headers?: Headers;
};

export type ApiFetchArgs<T extends CollectionSlug> = {
  method: ApiMethod;
  body?: RequiredDataFromCollectionSlug<T> | FormData | { value: unknown };
} & BaseApiFetchArgs;
//#endregion

//#region  Arguments and Options Types
export interface BaseOptions<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
  TPaginate extends boolean = boolean,
> {
  /**
   * the Collection slug to operate against.
   */
  collection: TSlug;
  /**
   * [Control auto-population](https://payloadcms.com/docs/queries/depth) of nested relationship and upload fields.
   */
  depth?: number;
  /**
   * Whether the documents should be queried from the versions table/collection or not. [More](https://payloadcms.com/docs/versions/drafts#draft-api)
   */
  draft?: boolean;
  /**
   * Specify a [fallback locale](https://payloadcms.com/docs/configuration/localization) to use for any returned documents.
   */
  fallbackLocale?: false | TypedLocale | TypedLocale[];
  /**
   * The maximum related documents to be returned.
   * Defaults unless `defaultLimit` is specified for the collection config
   * @default 10
   */
  limit?: number;
  /**
   * Specify [locale](https://payloadcms.com/docs/configuration/localization) for any returned documents.
   */
  locale?: 'all' | TypedLocale;
  /**
   * Get a specific page number
   * @default 1
   */
  page?: number;
  /**
   * Set to `false` to return all documents and avoid querying for document counts which introduces some overhead.
   * You can also combine that property with a specified `limit` to limit documents but avoid the count query.
   */
  pagination?: TPaginate;
  /**
   * Specify [populate](https://payloadcms.com/docs/queries/select#populate) to control which fields to include to the result from populated documents.
   */
  populate?: PopulateType;
  /**
   * Specify [select](https://payloadcms.com/docs/queries/select) to control which fields to include to the result.
   */
  select?: TSelect;
  /**
   * Sort the documents, can be a string or an array of strings
   * @example '-createdAt' // Sort DESC by createdAt
   * @example ['group', '-createdAt'] // sort by 2 fields, ASC group and DESC createdAt
   */
  sort?: Sort;
  /**
   * When set to `true`, the query will include both normal and trashed documents.
   * To query only trashed documents, pass `trash: true` and combine with a `where` clause filtering by `deletedAt`.
   * By default (`false`), the query will only include normal documents and exclude those with a `deletedAt` field.
   *
   * This argument has no effect unless `trash` is enabled on the collection.
   * @default false
   */
  trash?: boolean;
  /**
   * A filter [query](https://payloadcms.com/docs/queries/overview)
   */
  where?: Where;
}

export type FindOptions<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
  TPaginate extends boolean = boolean,
> = BaseOptions<TSlug, TSelect, TPaginate> & {
  /**
   * The [Join Field Query](https://payloadcms.com/docs/fields/join#query-options).
   * Pass `false` to disable all join fields from the result.
   */
  joins?: JoinQuery<TSlug>;
};

export type CreateOptions<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
  TPaginate extends boolean = boolean,
> = {
  data: RequiredDataFromCollectionSlug<TSlug>;
} & BaseOptions<TSlug, TSelect, TPaginate>;

export type UploadFile<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
  TPaginate extends boolean = boolean,
> = {
  /**
   * A `File` object when creating a collection with `upload: true`.
   */
  file: File;
  /**
   * If you want to create a document that is a duplicate of another document
   */
  duplicateFromID?: DataFromCollectionSlug<TSlug>['id'];
  data?: RequiredDataFromCollectionSlug<TSlug>;
  /**
   * If you are uploading a file and would like to replace
   * the existing file instead of generating a new filename,
   * you can set the following property to `true`
   */
  overwriteExistingFiles?: boolean;
} & BaseOptions<TSlug, TSelect, TPaginate>;

export type UpdateOptions<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> = Omit<BaseOptions<TSlug, TSelect, false>, 'pagination' | 'page' | 'limit' | 'where' | 'sort'> & {
  data: DeepPartial<RequiredDataFromCollectionSlug<TSlug>>;
};

export type DeleteOptions<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> = Omit<UpdateOptions<TSlug, TSelect>, 'data'>;

export type UpdateByID<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> = {
  id: TypedCollection[TSlug]['id'];
} & UpdateOptions<TSlug, TSelect>;

export type UpdateMany<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> = {
  limit?: number;
  /**
   * Sort the documents, can be a string or an array of strings
   * @example '-createdAt' // Sort DESC by createdAt
   * @example ['group', '-createdAt'] // sort by 2 fields, ASC group and DESC createdAt
   */
  sort?: Sort;
  /**
   * A filter [query](https://payloadcms.com/docs/queries/overview)
   */
  where: Where;
} & UpdateOptions<TSlug, TSelect>;

export type DeleteByID<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> = {
  /**
   * The ID of the document to delete.
   */
  id: TypedCollection[TSlug]['id'];
} & DeleteOptions<TSlug, TSelect>;
export type DeleteMany<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> = {
  /**
   * A filter [query](https://payloadcms.com/docs/queries/overview)
   */
  where: Where;
} & DeleteOptions<TSlug, TSelect>;

export type FindOne<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> = Omit<FindOptions<TSlug, TSelect, false>, 'page' | 'limit' | 'pagination' | 'sort'> & {
  id: TypedCollection[TSlug]['id'];
};

export type FindMany<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
  TPaginate extends boolean = boolean,
> = FindOptions<TSlug, TSelect, TPaginate>;
//#endregion

//#region Result Types
export type CreateResult<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> = {
  message: string;
  doc: TransformCollectionWithSelect<TSlug, TSelect>;
};

export type FindOneResult<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> = TransformCollectionWithSelect<TSlug, TSelect>;

export type FindManyResult<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
  TPaginate extends boolean = boolean,
> = TPaginate extends true
  ? PaginatedDocs<TransformCollectionWithSelect<TSlug, TSelect>>
  : TransformCollectionWithSelect<TSlug, TSelect>[];

export type UpdateByIDResult<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> = {
  doc: TransformCollectionWithSelect<TSlug, TSelect>;
  message: string;
};

export type UpdateManyResult<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> = BulkOperationResult<TSlug, TSelect>;

export type DeleteByIDResult<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> = {
  doc: TransformCollectionWithSelect<TSlug, TSelect>;
  message: string;
};

export type DeleteManyResult<
  TSlug extends CollectionSlug = CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> = BulkOperationResult<TSlug, TSelect>;
//#endregion
