import type { URL } from 'url';
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
