import { createdByField } from '@/fields/createdByField';
import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import { COLLECTION_GROUP } from '@/lib/constants';
import type { CollectionConfig } from 'payload';
import {
  admin,
  authenticated,
  collectionCreator,
  collectionCreatorOrAdmin,
} from '../_access-control';
import { generateAlt } from './hooks/beforeChange';

export const Images: CollectionConfig<'images'> = {
  slug: 'images',
  access: {
    admin: admin,
    create: authenticated,
    read: authenticated,
    update: collectionCreator,
    delete: collectionCreatorOrAdmin,
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
    createdByField,
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
