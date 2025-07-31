import type { APIError } from 'payload';
import {
  Collection,
  CollectionDataBySlug,
  CollectionSlug,
  CollectionUpdateDataBySlug,
  FileCollectionSlug,
  Populate,
  Select,
  Where,
} from './collections';
import { CustomError } from './errors';

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
  body?: CollectionDataBySlug<T> | FormData | { value: unknown };
} & BaseApiFetchArgs;

export type SearchParams<S extends CollectionSlug, P extends boolean> = {
  page?: number;
  limit?: number;
  where?: Where;
  select?: Select<Collection<S>>;
  sort?: string;
  populate?: Populate;
  depth?: number;
  pagination?: P;
};

export type BaseApiClientArgs<Slug extends CollectionSlug, Paginated extends boolean> = {
  collection: Slug;
} & SearchParams<Slug, Paginated>;

export type BaseArgsWithoutPagination<Slug extends CollectionSlug> = Omit<
  BaseApiClientArgs<Slug, false>,
  'pagination' | 'page'
>;

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

export type FindResult<
  Slug extends CollectionSlug,
  Paginated extends boolean,
> = Paginated extends false ? Collection<Slug>[] : FetchGetResult<Collection<Slug>>;

export type FindArgs<Slug extends CollectionSlug, Paginated extends boolean> = BaseApiClientArgs<
  Slug,
  Paginated
>;

export type FindByIDArgs<Slug extends CollectionSlug> = Omit<
  BaseArgsWithoutPagination<Slug>,
  'limit' | 'sort'
> & {
  id: Collection<Slug>['id'];
};

export type CreateArgs<Slug extends CollectionSlug> = BaseArgsWithoutPagination<Slug> & {
  data: CollectionDataBySlug<Slug>;
};

export type CreateFileArgs<Slug extends FileCollectionSlug> = Pick<
  BaseArgsWithoutPagination<Slug>,
  'collection'
> & { data: FormData };

export type CreateResult<Slug extends Collection> = {
  message: string;
  doc: Slug;
};

export type UpdateByIDArgs<Slug extends CollectionSlug> = BaseArgsWithoutPagination<Slug> & {
  id: Collection<Slug>['id'];
  data: CollectionUpdateDataBySlug<Slug>;
};

export type UpdateResult<Slug extends Collection> = {
  docs: Slug[];
  errors: APIError[];
};
export type UpdateByIDResult<Slug extends Collection> = CreateResult<Slug>;
