import { COLLECTION_GROUP } from '@/lib/constants';
import type { CollectionConfig } from 'payload';
import { generateAlt, generateOwner } from './hooks/beforeChange';

export const Avatars: CollectionConfig<'avatars'> = {
  slug: 'avatars',
  access: {
    read: () => true,
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
    {
      name: 'owner',
      type: 'relationship',
      relationTo: ['users', 'admins'],
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
