import { getAppToast } from '@/hooks/useAppToast';
import { SIGN_UP_TOAST_ID } from '@/lib/constants';
import { SignUpSchema, VerifyOtpParams } from '@/lib/types';
import { getApiClient } from '@lactalink/api';
import { router } from 'expo-router';

export async function signUp({ email, password }: SignUpSchema) {
  const toast = getAppToast();
  const apiClient = getApiClient();

  toast.show({
    id: SIGN_UP_TOAST_ID,
    message: 'Creating account...',
    type: 'loading',
  });

  await apiClient.auth.signUp({ email, password });

  toast.show({
    id: SIGN_UP_TOAST_ID,
    message: '🎉 Account created.',
    type: 'success',
  });

  const params: VerifyOtpParams = { email: email, type: 'signup' };
  router.push({ pathname: '/auth/verify-otp', params });
}
