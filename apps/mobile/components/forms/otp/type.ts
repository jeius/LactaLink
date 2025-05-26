import { VerifyOtpParams } from '@supabase/supabase-js';

export interface OTPFormProps {
  email?: string;
  phone?: string;
  type: VerifyOtpParams['type'];
}
