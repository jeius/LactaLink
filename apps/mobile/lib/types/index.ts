import { signInSchema } from '@lactalink/types';
import { VerifyOtpParams } from '@supabase/supabase-js';
import { z } from 'zod';

export * from './profile';

export const signUpSchema = signInSchema;
export type SignUpSchema = z.infer<typeof signUpSchema>;

export type VerifyOTPSearchParams = {
  email?: string;
  phone?: string;
  type?: VerifyOtpParams['type'];
};

export type NativeFile = {
  uri: string;
  name: string;
  type: string;
};
