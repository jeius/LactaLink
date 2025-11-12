import { ownerField } from '@/fields/ownerField';
import { generateOwner } from '@/hooks/collections/generateOwner';
import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { COMMENT_STATUS } from '@lactalink/enums/posts';
import { CollectionConfig } from 'payload';
import { authenticated, collectionAuthorOrAdmin } from '../_access-control/general';
import { updateCommentRepliesCount, updatePostCommentCount } from './hooks/updateCounters';

export const Comments: CollectionConfig<'comments'> = {
  slug: 'comments',
  labels: { singular: 'Comment', plural: 'Comments' },
  admin: {
    useAsTitle: 'content',
    defaultColumns: ['content', 'author', 'post', 'parent', 'createdAt'],
    group: COLLECTION_GROUP.CONTENT,
  },
  timestamps: true,
  versions: false,
  trash: true,
  access: {
    create: authenticated,
    read: authenticated,
    update: collectionAuthorOrAdmin,
    delete: collectionAuthorOrAdmin,
  },
  hooks: {
    beforeChange: [generateOwner],
    afterChange: [updateCommentRepliesCount, updatePostCommentCount],
    afterDelete: [updateCommentRepliesCount, updatePostCommentCount],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'author',
          type: 'relationship',
          relationTo: ['individuals', 'hospitals', 'milkBanks'],
          required: true,
          admin: { readOnly: true, width: '50%' },
          index: true,
        },

        {
          name: 'post',
          type: 'relationship',
          relationTo: 'posts',
          required: true,
          admin: { description: 'Post this comment belongs to', readOnly: false, width: '50%' },
          index: true,
        },

        {
          name: 'status',
          type: 'select',
          enumName: 'comment_status_enum',
          options: Object.values(COMMENT_STATUS),
          defaultValue: COMMENT_STATUS.PUBLISHED.value,
          admin: { description: 'Moderation status for the comment.', width: '50%' },
        },
      ],
    },

    {
      name: 'parent',
      label: 'Parent Comment',
      type: 'relationship',
      relationTo: 'comments',
      admin: { description: 'Optional: parent comment for threaded replies' },
    },

    {
      name: 'content',
      type: 'textarea',
      required: true,
      admin: { description: 'Comment text (supports replies via parent field).' },
    },

    {
      name: 'mentions',
      type: 'array',
      label: 'Mentions',
      fields: [
        {
          name: 'user',
          type: 'relationship',
          relationTo: ['individuals', 'hospitals', 'milkBanks'],
          required: true,
          admin: { description: 'User mentioned in the comment.' },
        },
      ],
      admin: { description: 'Users mentioned in this comment.' },
    },

    {
      name: 'likes',
      type: 'join',
      collection: 'likes',
      on: 'liked',
      admin: {
        description: 'Likes associated with this comment.',
        defaultColumns: ['createdBy', 'createdAt'],
      },
    },

    // Aggregates to speed up feed rendering
    {
      name: 'likesCount',
      label: 'Likes Count',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true, position: 'sidebar' },
    },

    {
      name: 'repliesCount',
      label: 'Replies Count',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true, position: 'sidebar' },
    },

    ownerField,
  ],
};
