import { SIGN_OUT } from '@/lib/constants';
import { showErrorToastWithId } from '@/lib/utils/showErrorToast';
import { getApiClient } from '@lactalink/api';

import { getAppToast } from '@/hooks/useAppToast';

export async function signOut() {
  const apiClient = getApiClient();
  const toast = getAppToast();

  toast.show({
    id: SIGN_OUT,
    message: 'Signing out...',
    type: 'loading',
  });

  try {
    await apiClient.auth.signOut();
    toast.close(SIGN_OUT);
  } catch (error) {
    showErrorToastWithId(error, SIGN_OUT);
  }
}
