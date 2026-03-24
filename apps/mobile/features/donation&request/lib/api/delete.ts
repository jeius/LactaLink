import { getApiClient } from '@lactalink/api';
import { MilkBag } from '@lactalink/types/payload-generated-types';

/**
 * Deletes a milk bag by its ID.
 *
 * @param id - The ID of the milk bag to delete.
 * @param options - Optional parameters to specify if the milk bag should be
 * moved to trash or deleted as a draft.
 * @param options.draft - If true, the milk bag will be deleted as a draft.
 * Default is `false`.
 * @param options.trash - If true, the milk bag will be moved to trash instead
 * of being permanently deleted. Default is `true`.
 *
 * @returns A promise that resolves to the deleted MilkBag object.
 * @throws Will throw an error if the API call fails.
 */
export async function deleteMilkBag(
  id: string,
  options: {
    draft?: boolean;
    trash?: boolean;
  } = {}
): Promise<MilkBag> {
  const { draft = false, trash = true } = options;
  const apiClient = getApiClient();
  return apiClient.deleteByID({ id, collection: 'milkBags', draft, trash });
}
