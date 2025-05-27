import { getAppToast } from '@/hooks/useAppToast';
import { extractErrorMessage } from '@lactalink/utilities';

export const showErrorToast = (error: unknown) => {
  const toast = getAppToast();
  const message = extractErrorMessage(error);
  toast.closeAll();
  toast.show({
    id: 'error-toast',
    type: 'error',
    message: message || 'An unexpected error occurred.',
  });
};

export const showErrorToastWithId = (error: unknown, id: string) => {
  const toast = getAppToast();
  const message = extractErrorMessage(error);
  toast.closeAll();
  toast.show({
    id,
    type: 'error',
    message: message || 'An unexpected error occurred.',
  });
};
