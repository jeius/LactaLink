import { AuthError } from '@supabase/supabase-js';

export type CustomError =
  | Error
  | {
      message: string;
      code?: number;
    };

type CustomErrorCode = 'admin_creation_failed' | 'google_auth_error';
export type ErrorCodes = AuthError['code'] | CustomErrorCode;
