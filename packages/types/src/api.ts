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

export type SearchParams<T extends CollectionSlug> = {
  page?: number;
  limit?: number;
  where?: Where;
  select?: Select<Collection<T>>;
  sort?: keyof Collection<T>;
  populate?: Populate;
  depth?: number;
};

export type ApiClientArgs<T extends CollectionSlug, Paginated extends boolean = true> = {
  collection: T;
  pagination?: Paginated;
} & SearchParams<T>;

export type ApiClientArgsWithoutPagination<T extends CollectionSlug> = Omit<
  ApiClientArgs<T, false>,
  'pagination' | 'page'
>;

export type PaginatedResult<T extends Collection> = {
  docs: T[];
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
  T extends CollectionSlug,
  isPaginated extends boolean,
> = isPaginated extends false ? Collection<T>[] : PaginatedResult<Collection<T>>;

export type FindArgs<T extends CollectionSlug, IsPaginated extends boolean> = ApiClientArgs<
  T,
  IsPaginated
>;

export type FindByIDArgs<T extends CollectionSlug> = ApiClientArgsWithoutPagination<T> & {
  id: Collection<T>['id'];
};

export type CreateArgs<T extends CollectionSlug> = ApiClientArgsWithoutPagination<T> & {
  data: CollectionDataBySlug<T>;
};

export type CreateFileArgs<T extends FileCollectionSlug> = Pick<
  ApiClientArgsWithoutPagination<T>,
  'collection'
> & { data: FormData };

export type CreateResult<T extends Collection> = {
  message: string;
  doc: T;
};

export type UpdateByIDArgs<T extends CollectionSlug> = ApiClientArgsWithoutPagination<T> & {
  id: Collection<T>['id'];
  data: CollectionUpdateDataBySlug<T>;
};

export type UpdateResult<T extends Collection> = {
  docs: T[];
  errors: APIError[];
};
export type UpdateByIDResult<T extends Collection> = CreateResult<T>;
