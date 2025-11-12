import { createdByProfileField } from '@/fields/createdByField';
import { generateCreatedByProfile } from '@/hooks/collections/generateCreatedBy';
import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { CollectionConfig } from 'payload';
import { admin, authenticated, collectionCreatorProfileOrAdmin } from '../_access-control';
import { ensureNoDuplicate } from './hooks/ensureNoDuplicate';
import { deleteDocLikesCount, updateDocLikesCount } from './hooks/updateCounters';

export const Likes: CollectionConfig<'likes'> = {
  slug: 'likes',
  access: {
    admin: admin,
    create: authenticated,
    read: authenticated,
    update: collectionCreatorProfileOrAdmin,
    delete: collectionCreatorProfileOrAdmin,
  },
  admin: {
    group: COLLECTION_GROUP.CONTENT,
    useAsTitle: 'liked',
    defaultColumns: ['liked', 'createdBy', 'createdAt'],
  },
  hooks: {
    beforeChange: [generateCreatedByProfile, ensureNoDuplicate],
    afterChange: [updateDocLikesCount],
    afterDelete: [deleteDocLikesCount],
  },
  fields: [
    createdByProfileField,
    {
      name: 'liked',
      label: 'Liked Document',
      type: 'relationship',
      relationTo: ['posts', 'comments'],
      required: true,
      admin: {
        description: 'The post/comment that was liked',
      },
    },
  ],
};
