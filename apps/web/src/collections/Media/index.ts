import { collectionGroup } from '@/lib/constants';
import type { CollectionConfig } from 'payload';

export const Media: CollectionConfig<'media'> = {
  slug: 'media',
  access: {
    read: () => true,
  },
  admin: {
    group: collectionGroup.system,
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
