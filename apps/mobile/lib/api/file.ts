import { getApiClient } from '@lactalink/api';
import { ImageSchema } from '@lactalink/form-schemas';
import {
  RequiredDataFromCollectionSlug,
  UploadCollectionSlug,
} from '@lactalink/types/payload-types';

import { File } from 'expo-file-system';

export async function uploadImage<TSlug extends UploadCollectionSlug = UploadCollectionSlug>(
  collection: TSlug,
  image: Pick<ImageSchema, 'url' | 'alt'>,
  data?: RequiredDataFromCollectionSlug<TSlug>
) {
  const file = new File(image.url);

  // @ts-expect-error - TS can't infer the correct type for this
  return await getApiClient().uploadFile({
    collection,
    file: file,
    data: { alt: image.alt, ...data },
  });
}

export async function upsertImage<TSlug extends UploadCollectionSlug = UploadCollectionSlug>(
  collection: TSlug,
  data: ImageSchema
) {
  const apiClient = getApiClient();
  const id = data.id;

  if (id) {
    return await apiClient.findByID({ collection, id });
  }
  return await uploadImage(collection, data);
}
