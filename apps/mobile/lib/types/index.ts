import { signInSchema } from '@lactalink/types';
import { VerifyOtpParams } from '@supabase/supabase-js';
import { z } from 'zod';

export const signUpSchema = signInSchema;
export type SignUpSchema = z.infer<typeof signUpSchema>;

export type VerifyOTPSearchParams = {
  email?: string;
  phone?: string;
  type?: VerifyOtpParams['type'];
};
