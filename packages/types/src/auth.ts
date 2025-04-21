import type { SanitizedPermissions } from 'payload';
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
      error?: CustomError;
      message: string;
      user: null;
    };
