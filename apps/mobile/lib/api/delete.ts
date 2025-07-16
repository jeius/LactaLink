import { getApiClient } from '@lactalink/api';
import { CollectionSlug } from '@lactalink/types';
import { extractErrorMessage } from '@lactalink/utilities/errors';
import { toast } from 'sonner-native';

const apiClient = getApiClient();

export async function deleteCollection(slug: CollectionSlug, id: string) {
  async function promise() {
    const doc = await apiClient.deleteByID({
      collection: slug,
      id,
    });

    const docName = 'name' in doc ? doc.name : null;

    const message = docName ? `${docName} has been deleted successfully.` : 'Deleted successfully.';
    return { message };
  }

  const executePromise = promise();

  toast.promise(executePromise, {
    loading: 'Deleting...',
    success: (res: { message: string }) => res.message,
    error: (error) => extractErrorMessage(error),
  });

  const { message } = await executePromise.catch(() => ({ message: null }));

  return Boolean(message);
}
