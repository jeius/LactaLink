import { imageFields } from '@/fields/imageFields';
import { ownerField } from '@/fields/ownerField';
import { generateOwner } from '@/hooks/collections/generateOwner';
import { COLLECTION_GROUP } from '@/lib/constants';
import type { CollectionConfig } from 'payload';
import {
  admin,
  authenticated,
  collectionOwner,
  collectionOwnerOrAdmin,
} from '../../_access-control';

export const Avatars: CollectionConfig<'avatars'> = {
  slug: 'avatars',
  access: {
    admin: admin,
    create: authenticated,
    read: authenticated,
    update: collectionOwner,
    delete: collectionOwnerOrAdmin,
  },
  admin: {
    group: COLLECTION_GROUP.MEDIA,
    description:
      'Avatars are images used to represent users in the system. They can be uploaded by users themselves or by administrators.',
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'owner'],
  },
  hooks: {
    beforeChange: [generateOwner],
  },
  fields: [...imageFields, ownerField],
  upload: {
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
    focalPoint: true,
    displayPreview: true,
    formatOptions: { format: 'webp' },
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        withoutEnlargement: false,
      },
      {
        name: 'icon',
        width: 50,
        height: 50,
        withoutEnlargement: false,
      },
    ],
  },
};
