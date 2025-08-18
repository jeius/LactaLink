import { DeepPartial } from 'react-hook-form';
import { Collection, Populate, Select } from './collections';
import { CustomError } from './errors';
import type {
  BulkOperationResult,
  CollectionSlug,
  RequiredDataFromCollectionSlug,
  SelectFromCollectionSlug,
  Sort,
  TransformCollectionWithSelect,
  TypedLocale,
  Where,
} from './payload-types';
import { PaginatedDocs } from './payload-types/database';

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

export type ApiMethodWithBody = 'POST' | 'PATCH' | 'PUT';

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

export type SearchParams<S extends CollectionSlug = CollectionSlug, P extends boolean = boolean> = {
  page?: number;
  limit?: number;
  where?: Where;
  select?: Select<Collection<S>>;
  sort?: string;
  populate?: Populate;
  depth?: number;
  pagination?: P;
};

export type FetchGetResult<C extends Collection> = {
  docs: C[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
  nextPage: number | null;
  prevPage: number | null;
  page: number;
  totalPages: number;
  totalDocs: number;
  pagingCounter: number;
};
//#endregion

//#region  Arguments and Options Types
export interface Options<
  TSlug extends CollectionSlug,
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
  fallbackLocale?: false | TypedLocale;
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
   * Skip access control.
   * Set to `false` if you want to respect Access Control for the operation, for example when fetching data for the fron-end.
   * @default true
   */
  overrideAccess?: boolean;
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
  populate?: Populate;
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
   * A filter [query](https://payloadcms.com/docs/queries/overview)
   */
  where?: Where;
}

export type FindOptions<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
  TPaginate extends boolean = boolean,
> = Options<TSlug, TSelect, TPaginate>;

export type CreateOptions<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
  TPaginate extends boolean = boolean,
> = {
  data: RequiredDataFromCollectionSlug<TSlug>;
} & Options<TSlug, TSelect, TPaginate>;

export type UploadFile<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
  TPaginate extends boolean = boolean,
> = {
  file: File;
  data?: RequiredDataFromCollectionSlug<TSlug>;
} & Options<TSlug, TSelect, TPaginate>;

export type UpdateOptions<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> = Omit<Options<TSlug, TSelect, false>, 'pagination' | 'page' | 'limit' | 'where' | 'sort'> & {
  data: DeepPartial<RequiredDataFromCollectionSlug<TSlug>>;
};

export type DeleteOptions<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> = Omit<UpdateOptions<TSlug, TSelect>, 'data'>;

export type UpdateByID<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> = {
  id: Collection<TSlug>['id'];
} & UpdateOptions<TSlug, TSelect>;

export type UpdateMany<
  TSlug extends CollectionSlug,
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
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> = {
  /**
   * The ID of the document to delete.
   */
  id: Collection<TSlug>['id'];
} & DeleteOptions<TSlug, TSelect>;
export type DeleteMany<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> = {
  /**
   * A filter [query](https://payloadcms.com/docs/queries/overview)
   */
  where: Where;
} & DeleteOptions<TSlug, TSelect>;

export type FindOne<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> = Omit<FindOptions<TSlug, TSelect, false>, 'page' | 'limit' | 'pagination' | 'sort'> & {
  id: Collection<TSlug>['id'];
};

export type FindMany<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
  TPaginate extends boolean = boolean,
> = FindOptions<TSlug, TSelect, TPaginate>;
//#endregion

//#region Result Types
export type CreateResult<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> = {
  message: string;
  doc: TransformCollectionWithSelect<TSlug, TSelect>;
};

export type FindOneResult<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> = TransformCollectionWithSelect<TSlug, TSelect>;

export type FindManyResult<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
  TPaginate extends boolean = boolean,
> = TPaginate extends true
  ? PaginatedDocs<TransformCollectionWithSelect<TSlug, TSelect>>
  : TransformCollectionWithSelect<TSlug, TSelect>[];

export type UpdateByIDResult<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> = {
  doc: TransformCollectionWithSelect<TSlug, TSelect>;
  message: string;
};

export type UpdateManyResult<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> = BulkOperationResult<TSlug, TSelect>;

export type DeleteByIDResult<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> = TransformCollectionWithSelect<TSlug, TSelect>;

export type DeleteManyResult<
  TSlug extends CollectionSlug,
  TSelect extends SelectFromCollectionSlug<TSlug> = SelectFromCollectionSlug<TSlug>,
> = BulkOperationResult<TSlug, TSelect>;
//#endregion
