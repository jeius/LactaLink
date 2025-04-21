import { APIError, ValidationError } from 'payload';

export type CustomError =
  | Error
  | APIError
  | ValidationError
  | {
      message: string;
      code?: number;
    };
