import { ownerField } from '@/fields/ownerField';
import { generateOwner } from '@/hooks/collections/generateOwner';
import { COLLECTION_GROUP } from '@/lib/constants';
import type { CollectionConfig } from 'payload';
import { admin, authenticated, collectionOwnerOrAdmin } from '../_access-control';
import { generateAlt } from './hooks/generateAlt';

export const Avatars: CollectionConfig<'avatars'> = {
  slug: 'avatars',
  access: {
    admin: admin,
    create: authenticated,
    read: authenticated,
    update: collectionOwnerOrAdmin,
    delete: collectionOwnerOrAdmin,
  },
  admin: {
    group: COLLECTION_GROUP.CONTENT,
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'owner'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
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
        name: 'icon',
        width: 50,
        height: 50,
      },
    ],
  },
  hooks: {
    beforeChange: [generateAlt, generateOwner],
  },
};
