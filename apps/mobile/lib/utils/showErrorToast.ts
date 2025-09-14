import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { toast } from 'sonner-native';

export const showErrorToast = (error: unknown) => {
  const message = extractErrorMessage(error);
  toast.dismiss();
  toast.error(message, { id: 'error-toast', closeButton: false });
};

export const showErrorToastWithId = (error: unknown, id: string) => {
  const message = extractErrorMessage(error);
  toast.error(message, { id, closeButton: false });
};
