import { createdByField } from '@/fields/createdByField';
import { imageFields } from '@/fields/imageFields';
import { ownerField } from '@/fields/ownerField';
import { generateOwner } from '@/hooks/collections/generateOwner';
import { COLLECTION_GROUP } from '@/lib/constants';
import type { CollectionConfig } from 'payload';
import { admin, authenticated, collectionOwnerOrAdmin } from '../../_access-control';

export const IdentityImages: CollectionConfig<'identity-images'> = {
  slug: 'identity-images',
  access: {
    admin: admin,
    create: authenticated,
    read: collectionOwnerOrAdmin,
    update: collectionOwnerOrAdmin,
    delete: collectionOwnerOrAdmin,
  },
  admin: {
    group: COLLECTION_GROUP.MEDIA,
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'createdBy'],
  },
  hooks: {
    beforeChange: [generateOwner],
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
    ],
  },
};
