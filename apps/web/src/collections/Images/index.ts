import { COLLECTION_GROUP } from '@/lib/constants';
import type { CollectionConfig } from 'payload';
import { generateAlt, generateCreatedBy } from './hooks/beforeChange';

export const Images: CollectionConfig<'images'> = {
  slug: 'images',
  access: {
    read: () => true,
  },
  admin: {
    group: COLLECTION_GROUP.CONTENT,
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'createdBy'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: ['users'],
      admin: {
        position: 'sidebar',
      },
    },
  ],
  upload: {
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
  hooks: {
    beforeChange: [generateAlt, generateCreatedBy],
  },
};
