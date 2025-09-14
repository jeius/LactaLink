import { getApiClient } from '@lactalink/api';
import { CollectionSlug } from '@lactalink/types/payload-types';
import { extractErrorMessage } from '@lactalink/utilities/extractors';
import { toast } from 'sonner-native';

const apiClient = getApiClient();

export async function deleteCollection(
  slug: CollectionSlug,
  id?: string | null,
  options: { silent?: boolean } = {}
): Promise<boolean> {
  if (!id) return false;

  const { silent = false } = options;

  async function promise(id: string) {
    const doc = await apiClient.deleteByID({
      collection: slug,
      id,
    });

    const docName = 'name' in doc ? doc.name : null;

    const message = docName ? `${docName} has been deleted successfully.` : 'Deleted successfully.';
    return { message };
  }

  const executePromise = promise(id);

  if (!silent) {
    toast.promise(executePromise, {
      loading: 'Deleting...',
      success: (res: { message: string }) => res.message,
      error: (error) => extractErrorMessage(error),
    });
  }

  const { message } = await executePromise.catch(() => ({ message: null }));

  return Boolean(message);
}
