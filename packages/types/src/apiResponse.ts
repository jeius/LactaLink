import { CustomError } from './errors';

export type APIResponse<T> =
  | {
      message: string;
      data: T;
      status?: number;
    }
  | {
      message: string;
      error?: CustomError;
      status?: number;
    };
