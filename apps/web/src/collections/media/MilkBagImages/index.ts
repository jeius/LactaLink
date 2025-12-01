import { createdByField } from '@/fields/createdByField';
import { imageFields } from '@/fields/imageFields';
import { ownerField } from '@/fields/ownerField';
import { generateAlt } from '@/hooks/collections/generateAlt';
import { generateBlurHash } from '@/hooks/collections/generateBlurHash';
import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import { generateOwner } from '@/hooks/collections/generateOwner';
import { COLLECTION_GROUP } from '@/lib/constants';
import type { CollectionConfig } from 'payload';
import { admin, anyone, authenticated, collectionCreatorOrAdmin } from '../../_access-control';

export const MilkBagImages: CollectionConfig<'milk-bag-images'> = {
  slug: 'milk-bag-images',
  access: {
    admin: admin,
    create: authenticated,
    read: anyone,
    update: collectionCreatorOrAdmin,
    delete: collectionCreatorOrAdmin,
  },
  admin: {
    group: COLLECTION_GROUP.MEDIA,
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'createdBy'],
  },
  hooks: {
    beforeChange: [generateAlt, generateBlurHash, generateCreatedBy, generateOwner],
  },
  fields: [...imageFields, createdByField, ownerField],
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
