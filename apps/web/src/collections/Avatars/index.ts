import { ownerField } from '@/fields/ownerField';
import { generateOwner } from '@/hooks/collections/generateOwner';
import { COLLECTION_GROUP } from '@/lib/constants';
import type { CollectionConfig } from 'payload';
import {
  admin,
  anyone,
  authenticated,
  collectionOwner,
  collectionOwnerOrAdmin,
} from '../_access-control';
import { generateAlt } from './hooks/generateAlt';

export const Avatars: CollectionConfig<'avatars'> = {
  slug: 'avatars',
  access: {
    admin: admin,
    create: authenticated,
    read: anyone,
    update: collectionOwner,
    delete: collectionOwnerOrAdmin,
  },
  admin: {
    group: COLLECTION_GROUP.PROFILES,
    description:
      'Avatars are images used to represent users in the system. They can be uploaded by users themselves or by administrators.',
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'owner'],
  },
  hooks: {
    beforeChange: [generateAlt, generateOwner],
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
};
