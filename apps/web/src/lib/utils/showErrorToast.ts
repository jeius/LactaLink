import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { toast } from 'sonner';

export function showErrorToastWithId(error: unknown, id: string) {
  const message = extractErrorMessage(error);
  toast.error(message, { id, dismissible: true });
}

export function showErrorToast(error: unknown) {
  const message = extractErrorMessage(error);
  toast.error(message, { dismissible: true });
}

export function showErrorToastWithMessage(message: string) {
  toast.error(message, { dismissible: true });
}
