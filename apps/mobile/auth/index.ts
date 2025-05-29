import { SignUpSchema } from '@/lib/types';
import { getApiClient } from '@lactalink/api';
import {
  ResendEmailOtpSearchParams,
  SignInSchema,
  VerifyOtp,
  VerifyOtpSearchParams,
} from '@lactalink/types';
import { extractAuthErrorCode, extractName, isResend } from '@lactalink/utilities';
import { VerifyOtpParams } from '@supabase/supabase-js';
import { router } from 'expo-router';

export * from './googleSignIn';

export async function signIn(formData: SignInSchema) {
  const apiClient = getApiClient();
  const email = formData.email;

  try {
    const user = await apiClient.auth.signIn(formData);
    const name = extractName(user) || user.email;

    router.replace('/home');

    return `Welcome back! ${name}`;
  } catch (error) {
    const code = extractAuthErrorCode(error);
    if (code === 'email_not_confirmed') {
      const params: ResendEmailOtpSearchParams = { email, type: 'signup' };
      await apiClient.auth.sendVerification(params);

      router.push({ pathname: '/auth/verify-otp', params });
      return `Verification email sent to ${formData.email}`;
    }
    throw error;
  }
}

export async function signUp({ email, password }: SignUpSchema) {
  const apiClient = getApiClient();
  await apiClient.auth.signUp({ email, password });

  const params: VerifyOtpSearchParams = { email: email, type: 'signup' };
  router.push({ pathname: '/auth/verify-otp', params });

  return 'Account created.';
}

export async function signOut() {
  const apiClient = getApiClient();
  await apiClient.auth.signOut();
  return 'Signed out successfully!';
}

export async function verifyOTP(params: VerifyOtpParams) {
  const apiClient = getApiClient();

  await apiClient.auth.verifyOTP(params);

  switch (params.type) {
    case 'recovery':
      router.replace('/auth/reset-password');
      return 'OTP verified. You can now reset your password.';
    case 'signup':
      router.replace('/setup-profile');
      return 'OTP verified. You can now complete your profile setup.';
    default:
      router.replace('/home');
      break;
  }
  return 'OTP verified successfully.';
}

export async function sendOtp(params: VerifyOtp) {
  const apiClient = getApiClient();
  const recipient = 'email' in params ? params.email : params.phone;

  if (isResend(params)) {
    await apiClient.auth.sendVerification(params);
  } else {
    await apiClient.auth.resetPasswordForEmail(params.email);
  }

  return `Verification sent to ${recipient}.`;
}

export async function updatePassword(password: string) {
  const apiClient = getApiClient();
  await apiClient.auth.updatePassword(password);

  if (router.canDismiss()) {
    router.dismiss();
  } else {
    router.replace('/auth/sign-in');
  }

  return 'Password updated successfully.';
}

export async function resetPassword(email: string) {
  const apiClient = getApiClient();
  await apiClient.auth.resetPasswordForEmail(email);

  const params: VerifyOtpSearchParams = { email, type: 'recovery' };
  router.push({ pathname: '/auth/verify-otp', params });

  return `Verification code sent to ${email}.`;
}
