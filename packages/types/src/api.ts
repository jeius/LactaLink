import type { URL } from 'url';
import {
  CollectionOperation,
  CollectionOperationData,
  Collections,
  CollectionSlug,
  Populate,
  Select,
  Where,
} from './collections';
import { CustomError } from './errors';

export type APIResponse<T> =
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

export type APIParams = {
  method?: 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT';
  url: URL;
  token?: string;
  vercelToken?: string;
  // eslint-disable-next-line no-undef
  body?: Record<string, unknown> | FormData;
  // eslint-disable-next-line no-undef
  headers?: Headers;
};

export type ApiOptions<T extends Collections, O extends CollectionOperation> = {
  collection: CollectionSlug;
  apiUrl: string;
  vercelToken?: string;
  token?: string | null;
  page?: number;
  limit?: number;
  where?: Where;
  select?: Select<T>;
  populate?: Populate;
  depth?: number;
  // eslint-disable-next-line no-undef
  data: CollectionOperationData<T, O> | FormData;
};

export type FindResult<T extends Collections> = {
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

export type CreateResult<T extends Collections> = {
  message: string;
  doc: T;
};

export type UpdateResult<T extends Collections> = CreateResult<T>;
