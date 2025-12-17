import { createUserProfileField } from '@/fields/userField';
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
    beforeChange: [ensureNoDuplicate],
    afterChange: [updateDocLikesCount],
    afterDelete: [deleteDocLikesCount],
  },
  fields: [
    createUserProfileField({ name: 'createdBy', required: true }),
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
