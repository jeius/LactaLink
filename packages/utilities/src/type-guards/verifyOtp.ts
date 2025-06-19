import { RecoveryEmailOtp, VerifyOtp } from '@lactalink/types/auth';
import { ResendParams } from '@supabase/supabase-js';

export function isRecovery(params: VerifyOtp): params is RecoveryEmailOtp {
  return 'email' in params && params.type === 'recovery';
}

export function isResend(params: VerifyOtp): params is ResendParams {
  return 'email' in params && params.type !== 'recovery';
}
