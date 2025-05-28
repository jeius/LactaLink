import type {
  AuthError,
  ResendParams,
  EmailOtpType as SbEmailOtpType,
  SupabaseClient,
  VerifyOtpParams,
} from '@supabase/supabase-js';
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

export type OTPType = Pick<ResendParams, 'type'> | Extract<SbEmailOtpType, 'recovery'>;

type SbEmailOtp = Extract<ResendParams, { type: SbEmailOtpType }>;

type RecoveryOtpType = Extract<VerifyOtpParams['type'], 'recovery'>;

export type RecoveryEmailOtp = {
  type: RecoveryOtpType;
  email: string;
};

export type EmailOtpType = Extract<SbEmailOtpType, SbEmailOtp['type'] | RecoveryOtpType>;

export type EmailOtp = Omit<Extract<ResendParams, { type: EmailOtpType }>, 'type'> & {
  type: EmailOtpType;
};

export type VerifyOTP = EmailOtp | Exclude<ResendParams, { type: EmailOtpType }>;
