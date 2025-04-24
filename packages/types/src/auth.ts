import type { SignInWithIdTokenCredentials } from '@supabase/supabase-js';
import type { SanitizedPermissions } from 'payload';
import { CustomError } from './errors';
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
      error?: CustomError;
      message: string;
      user: null;
    };

export type OAuthData = Pick<SignInWithIdTokenCredentials, 'provider' | 'options' | 'nonce'>;
