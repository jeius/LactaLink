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
      errors?: CustomError[];
      message: string;
      user: null;
    };

export type AuthSuccess = Extract<AuthResult, { user: User }>;
export type AuthError = Extract<AuthResult, { user: null }>;

export type OAuthData = Pick<SignInWithIdTokenCredentials, 'provider' | 'options' | 'nonce'>;
