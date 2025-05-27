import { signInSchema } from '@lactalink/types';
import { EmailOtpType, MobileOtpType, ResendParams as SbResendParams } from '@supabase/supabase-js';
import { z } from 'zod';

export * from './profile';

export const signUpSchema = signInSchema;
export type SignUpSchema = z.infer<typeof signUpSchema>;

export type VerifyOtpParams =
  | {
      email: string;
      type: EmailOtpType;
    }
  | {
      phone: string;
      type: MobileOtpType;
    };

type EmailResendParams = {
  type: Extract<EmailOtpType, 'recovery'>;
  email: string;
  options?: {
    emailRedirectTo?: string;
    captchaToken?: string;
  };
};

export type ResendParams = SbResendParams | EmailResendParams;

export type NativeFile = {
  uri: string;
  name: string;
  type: string;
};
