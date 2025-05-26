import type { AuthError, SupabaseClient } from '@supabase/supabase-js';
import type { SanitizedPermissions } from 'payload';
import type { User } from './payload-types';

export type MeUser =
  | {
      exp?: number;
      token?: string;
      user: User;
      permissions: SanitizedPermissions;
      message: string;
    }
  | {
      message: string;
      user: null;
    };

export type BackendSession = {
  user: User | null;
  permissions?: SanitizedPermissions;
  message: string;
};

export type AuthParams = {
  supabase: SupabaseClient;
  apiUrl: string;
  vercelToken?: string;
};

export type SignInParams = AuthParams & { email: string; password: string };

export type SignUpParams = { email: string; password: string; supabase: SupabaseClient };

export type AuthResult = { data: Extract<MeUser, { user: User }> } | { error: AuthError };

export type OTPType = 'signup' | 'email_change' | 'recovery';
