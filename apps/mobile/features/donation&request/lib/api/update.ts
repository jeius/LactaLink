import { getApiClient } from '@lactalink/api';
import { ImageSchema, MilkBagSchema } from '@lactalink/form-schemas';
import { UpdateByIDResult } from '@lactalink/types/api';
import { MilkBag } from '@lactalink/types/payload-generated-types';
import { File } from 'expo-file-system';

export async function updateDraftMilkBag({ id, bagImage: _, code: __, ...data }: MilkBagSchema) {
  const apiClient = getApiClient();

  return apiClient.updateByID({
    collection: 'milkBags',
    id: id,
    data: data,
    draft: true,
    // Enable autoSave to avoid multiple drafts for the same milk bag
    autoSave: true,
  });
}

export async function updateDraftMilkBagImage(
  bagID: string,
  imageData: ImageSchema
): Promise<MilkBag> {
  const apiClient = getApiClient();

  const response = await apiClient.request({
    path: `/milkBags/${bagID}`,
    method: 'PATCH',
    file: new File(imageData.url),
    json: { bagImage: imageData.id },
    args: {
      draft: true,
      // @ts-expect-error - No Payload type definition for this yet
      autoSave: true,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update milk bag image');
  }

  const data: UpdateByIDResult<'milkBags'> = await response.json();

  return data.doc as MilkBag;
}
