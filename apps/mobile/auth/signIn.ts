import { getAppToast } from '@/hooks/useAppToast';
import { SIGN_IN_TOAST_ID } from '@/lib/constants';
import { VerifyOtpParams } from '@/lib/types';
import { extractName } from '@/lib/utils/extractName';
import { showErrorToastWithId } from '@/lib/utils/showErrorToast';
import { getApiClient } from '@lactalink/api';
import { SignInSchema } from '@lactalink/types';
import { extractAuthErrorCode } from '@lactalink/utilities';
import { router } from 'expo-router';

export async function signIn(formData: SignInSchema) {
  const toast = getAppToast();
  const apiClient = getApiClient();

  toast.show({
    id: SIGN_IN_TOAST_ID,
    message: 'Signing in...',
    type: 'loading',
  });

  try {
    const user = await apiClient.auth.signIn(formData);
    const name = extractName(user) || user.email;

    toast.show({
      id: SIGN_IN_TOAST_ID,
      message: `👋 Welcome back! ${name}`,
      type: 'success',
    });
    router.replace('/home');
  } catch (error) {
    const code = extractAuthErrorCode(error);
    if (code === 'email_not_confirmed') {
      const type: VerifyOtpParams['type'] = 'signup';
      const email = formData.email;

      try {
        await apiClient.auth.sendVerification({ email, type });

        toast.close(SIGN_IN_TOAST_ID);
        const params: VerifyOtpParams = { email, type };
        router.push({ pathname: '/auth/verify-otp', params });
      } catch (err) {
        showErrorToastWithId(error, SIGN_IN_TOAST_ID);
      }

      return;
    }
    showErrorToastWithId(error, SIGN_IN_TOAST_ID);
  }
}
