'use server';

import { createClient } from '@/lib/utils/supabase/server';
import { VerifyOtpParams } from '@supabase/supabase-js';

export async function verifyOtp(params: VerifyOtpParams) {
  const supabase = await createClient();
  const {
    error: otpError,
    data: { session },
  } = await supabase.auth.verifyOtp(params);

  if (otpError || !session) {
    return { user: null, message: otpError?.message || 'Session not found.' };
  }

  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.setSession(session);

  if (sessionError && !user) {
    return { user: null, message: sessionError.message };
  }

  return { user, message: 'Verification successfull.' };
}
