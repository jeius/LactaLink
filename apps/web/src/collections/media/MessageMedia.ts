import { createdByField } from '@/fields/createdByField';
import { imageFields } from '@/fields/imageFields';
import { generateAlt } from '@/hooks/collections/generateAlt';
import { generateBlurHash } from '@/hooks/collections/generateBlurHash';
import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import { COLLECTION_GROUP } from '@/lib/constants';
import { CollectionConfig } from 'payload';
import { admin } from '../_access-control/admin';
import { anyone, authenticated, collectionCreatorOrAdmin } from '../_access-control/general';

const MessageMedia: CollectionConfig<'message-media'> = {
  slug: 'message-media',
  admin: {
    group: COLLECTION_GROUP.MEDIA,
  },
  access: {
    admin: admin,
    create: authenticated,
    read: anyone,
    update: collectionCreatorOrAdmin,
    delete: collectionCreatorOrAdmin,
  },
  fields: [...imageFields, createdByField],
  hooks: {
    beforeChange: [generateCreatedBy, generateBlurHash, generateAlt],
  },
  upload: {
    mimeTypes: ['image/*', 'application/pdf', 'audio/*'],
    adminThumbnail: 'thumbnail',
    displayPreview: true,
    formatOptions: { format: 'webp' },
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        height: 300,
      },
      {
        name: 'preview',
        width: 800,
        height: 600,
      },
    ],
  },
};

export default MessageMedia;
