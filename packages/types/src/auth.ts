import type { APIError, SanitizedPermissions, ValidationError } from 'payload';
import { CustomError } from './errors';
import type { Admin, User } from './payload-types';

export type AuthResult =
  | {
      exp: number;
      token?: string;
      user: User | Admin;
      permissions: SanitizedPermissions;
      message: string;
      collection: 'users' | 'admins';
    }
  | {
      error?: Error | APIError | ValidationError | CustomError;
      message: string;
      user: null;
    };
