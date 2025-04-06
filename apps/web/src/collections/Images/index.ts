import { collectionGroup } from '@/lib/constants';
import type { CollectionConfig } from 'payload';

export const Images: CollectionConfig<'images'> = {
  slug: 'images',
  access: {
    read: () => true,
  },
  admin: {
    group: collectionGroup.content,
    useAsTitle: 'filename',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
};
