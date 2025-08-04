import type {
  AuthError,
  ResendParams,
  EmailOtpType as SbEmailOtpType,
  SupabaseClient,
  VerifyOtpParams,
} from '@supabase/supabase-js';
import type { SanitizedPermissions, User } from './payload-types';

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

export type ResendEmailOtp = Extract<ResendParams, { type: SbEmailOtpType }>;

export type ResendEmailOtpSearchParams = Omit<ResendEmailOtp, 'options'>;

type RecoveryOtpType = Extract<VerifyOtpParams['type'], 'recovery'>;

export type RecoveryEmailOtp = {
  type: RecoveryOtpType;
  email: string;
};

export type EmailOtpType = Extract<SbEmailOtpType, ResendEmailOtp['type'] | RecoveryOtpType>;

export type EmailOtp = Omit<Extract<ResendParams, { email: string }>, 'type'> & {
  type: EmailOtpType;
};

export type PhoneOtp = Exclude<ResendParams, EmailOtp>;

export type VerifyOtp = EmailOtp | PhoneOtp;

export type EmailOtpSearchParams = Omit<EmailOtp, 'options'>;

export type PhoneOtpSearchParams = Omit<PhoneOtp, 'options'>;

export type VerifyOtpSearchParams = EmailOtpSearchParams | PhoneOtpSearchParams;
