import { imageFields } from '@/fields/imageFields';
import { createUserField } from '@/fields/userField';
import { COLLECTION_GROUP } from '@/lib/constants';
import { CollectionConfig } from 'payload';
import { admin } from '../_access-control/admin';
import { authenticated, collectionCreatorOrAdmin } from '../_access-control/general';

const ScreeningFiles: CollectionConfig<'screening-files'> = {
  slug: 'screening-files',
  admin: {
    group: COLLECTION_GROUP.MEDIA,
  },
  access: {
    admin: admin,
    create: authenticated,
    read: collectionCreatorOrAdmin,
    update: collectionCreatorOrAdmin,
    delete: collectionCreatorOrAdmin,
  },
  fields: [...imageFields, createUserField({ name: 'createdBy', required: true })],
  upload: {
    mimeTypes: ['image/*', 'application/pdf'],
    adminThumbnail: 'thumbnail',
    displayPreview: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        height: 300,
      },
    ],
  },
};

export default ScreeningFiles;
