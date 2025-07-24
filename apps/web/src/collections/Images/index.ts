import { createdByField } from '@/fields/createdByField';
import { ownerField } from '@/fields/ownerField';
import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import { generateOwner } from '@/hooks/collections/generateOwner';
import { COLLECTION_GROUP } from '@/lib/constants';
import type { CollectionConfig } from 'payload';
import { admin, anyone, authenticated, collectionOwnerOrAdmin } from '../_access-control';
import { generateAlt } from './hooks/beforeChange';

export const Images: CollectionConfig<'images'> = {
  slug: 'images',
  access: {
    admin: admin,
    create: authenticated,
    read: anyone,
    update: collectionOwnerOrAdmin,
    delete: collectionOwnerOrAdmin,
  },
  admin: {
    group: COLLECTION_GROUP.CONTENT,
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'createdBy'],
  },
  hooks: {
    beforeChange: [generateAlt, generateCreatedBy, generateOwner],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
    {
      name: 'blurHash',
      type: 'textarea',
      admin: {
        description: 'A string that represents a blurred version of the image.',
        position: 'sidebar',
      },
    },
    createdByField,
    ownerField,
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
        name: 'small',
        width: 600,
      },
      {
        name: 'large',
        width: 1400,
      },
    ],
  },
};
