import { getAppToast } from '@/hooks/useAppToast';
import { OTP_TOAST_ID } from '@/lib/constants';
import { showErrorToastWithId } from '@/lib/utils/showErrorToast';
import { getApiClient } from '@lactalink/api';
import { VerifyOtpParams } from '@supabase/supabase-js';
import { router } from 'expo-router';

export async function verifyOTP(params: VerifyOtpParams) {
  const apiClient = getApiClient();
  const toast = getAppToast();

  toast.show({
    id: OTP_TOAST_ID,
    message: 'Verifying code...',
    type: 'loading',
  });

  try {
    await apiClient.auth.verifyOTP(params);

    toast.close(OTP_TOAST_ID);

    switch (params.type) {
      case 'recovery':
        router.replace('/auth/reset-password');
        break;
      case 'signup':
        router.replace('/setup-profile');
        break;
      default:
        router.replace('/home');
        break;
    }
  } catch (error) {
    showErrorToastWithId(error, OTP_TOAST_ID);
  }
}
