import { ownerField } from '@/fields/ownerField';
import { generateBlurHash } from '@/hooks/collections/generateBlurHash';
import { generateOwner } from '@/hooks/collections/generateOwner';
import { COLLECTION_GROUP } from '@/lib/constants';
import type { CollectionConfig } from 'payload';
import {
  admin,
  anyone,
  authenticated,
  collectionOwner,
  collectionOwnerOrAdmin,
} from '../../_access-control';
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
    group: COLLECTION_GROUP.MEDIA,
    description:
      'Avatars are images used to represent users in the system. They can be uploaded by users themselves or by administrators.',
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'owner'],
  },
  hooks: {
    beforeChange: [generateAlt, generateOwner, generateBlurHash],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
    {
      name: 'blurHash',
      type: 'text',
      admin: {
        description: 'A string that represents a blurred version of the image.',
        position: 'sidebar',
        readOnly: true,
      },
    },
    ownerField,
  ],
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
