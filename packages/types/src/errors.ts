import { AuthError } from '@supabase/supabase-js';

export type CustomError =
  | Error
  | {
      message: string;
      code?: number;
    };

type CustomErrorCode = 'email_already_exists' | 'google_auth_error';
export type ErrorCodes = AuthError['code'] | CustomErrorCode;
