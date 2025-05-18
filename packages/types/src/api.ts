import type { URL } from 'url';
import { Collections } from './collections';
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
  // eslint-disable-next-line no-undef
  method?: RequestInit['method'];
  url: URL;
  token?: string;
  vercelToken?: string;
  body?: Record<string, unknown>;
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
