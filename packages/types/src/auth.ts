import type { SanitizedPermissions } from 'payload';
import type { User } from './payload-types';

export type AuthResult =
  | {
      exp: number;
      token?: string;
      user: User;
      permissions: SanitizedPermissions;
      message: string;
      collection: 'users';
    }
  | {
      message: string;
      user: null;
    };

export type OTPType = 'signup' | 'email_change';
