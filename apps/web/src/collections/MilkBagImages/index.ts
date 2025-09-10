import { createdByField } from '@/fields/createdByField';
import { ownerField } from '@/fields/ownerField';
import { generateAlt } from '@/hooks/collections/generateAlt';
import { generateBlurHash } from '@/hooks/collections/generateBlurHash';
import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import { generateOwner } from '@/hooks/collections/generateOwner';
import { COLLECTION_GROUP } from '@/lib/constants';
import type { CollectionConfig } from 'payload';
import { admin, anyone, authenticated } from '../_access-control';

export const MilkBagImages: CollectionConfig<'milk-bag-images'> = {
  slug: 'milk-bag-images',
  access: {
    admin: admin,
    create: authenticated,
    read: anyone,
    update: admin,
    delete: admin,
  },
  admin: {
    group: COLLECTION_GROUP.CONTENT,
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'createdBy'],
  },
  hooks: {
    beforeChange: [generateAlt, generateBlurHash, generateCreatedBy, generateOwner],
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
    createdByField,
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
        name: 'small',
        width: 600,
        withoutEnlargement: false,
      },
      {
        name: 'large',
        width: 1400,
        withoutEnlargement: false,
      },
    ],
  },
};
