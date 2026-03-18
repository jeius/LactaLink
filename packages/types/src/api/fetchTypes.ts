import { CollectionSlug } from '@/collections';
import { CustomError } from '@/errors';
import type { RequiredDataFromCollectionSlug } from '@/payload-types';

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
