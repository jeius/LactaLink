import { ownerField } from '@/fields/ownerField';
import { generateOwner } from '@/hooks/collections/generateOwner';
import { POST_ATTACHMENT_MEDIA_TYPE, POST_STATUS, POST_VISIBILITY } from '@lactalink/enums/posts';
import { CollectionConfig } from 'payload';
import { sharedFromFilter } from './filterOptions/sharedFromFIlter';
import { setSummary } from './hooks/beforeChange';
import { updatePostSharesCount } from './hooks/updatePostSharesCount';

export const Posts: CollectionConfig<'posts'> = {
  slug: 'posts',
  labels: {
    singular: 'Post',
    plural: 'Posts',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'status', 'visibility', 'createdAt'],
  },
  timestamps: true,
  versions: false,
  trash: true,
  hooks: {
    beforeChange: [setSummary, generateOwner],
    afterChange: [updatePostSharesCount],
  },
  fields: [
    {
      name: 'author',
      type: 'relationship',
      relationTo: ['individuals', 'hospitals', 'milkBanks'],
      required: true,
      admin: { readOnly: false },
      index: true,
    },

    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 100,
      admin: {
        description: 'Brief, descriptive title for the post (helps with searchability).',
      },
    },

    {
      name: 'content',
      type: 'textarea',
      admin: {
        description: 'Content of the post. Encourage clear, health-relevant info.',
      },
    },

    {
      name: 'summary',
      type: 'text',
      maxLength: 280,
      admin: {
        description: 'Short summary used in lists (keeps feed scannable).',
      },
    },

    {
      name: 'attachments',
      type: 'array',
      label: 'Media attachments',
      fields: [
        {
          name: 'mediaType',
          type: 'select',
          enumName: 'post_attachment_media_type_enum',
          required: true,
          options: Object.values(POST_ATTACHMENT_MEDIA_TYPE),
          defaultValue: POST_ATTACHMENT_MEDIA_TYPE.IMAGE.value,
          admin: { readOnly: true },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'images',
          admin: {
            description: 'Upload an image',
            condition: (_, { mediaType }) => mediaType === POST_ATTACHMENT_MEDIA_TYPE.IMAGE.value,
          },
        },
        {
          name: 'caption',
          type: 'text',
          maxLength: 2200,
          admin: { description: 'Optional caption for the media attachment.' },
        },
      ],
      admin: {
        description: 'Images/videos or documents attached to the post.',
      },
    },

    {
      type: 'row',
      fields: [
        {
          name: 'visibility',
          type: 'select',
          required: true,
          options: Object.values(POST_VISIBILITY),
          defaultValue: POST_VISIBILITY.PUBLIC.value,
          admin: { description: 'Who can see this post.', width: '50%' },
        },
        {
          name: 'status',
          type: 'select',
          options: Object.values(POST_STATUS),
          defaultValue: POST_STATUS.PUBLISHED.value,
          admin: { description: 'Moderation status. Admins can change.', width: '50%' },
        },
      ],
    },

    // Link to corresponding donation or request (optional)
    {
      name: 'sharedFrom',
      type: 'relationship',
      relationTo: ['posts', 'donations', 'requests'],
      hasMany: false,
      filterOptions: sharedFromFilter,
      validate: () => true, // Custom validation handled in filterOptions
      admin: { description: 'If this post is a share, the original post/donation/request.' },
    },

    // Join field to get comments on this post
    {
      name: 'comments',
      type: 'join',
      collection: 'comments',
      on: 'post',
      where: {
        and: [{ parent: { exists: false } }, { deletedAt: { exists: false } }],
      },
      admin: {
        description: 'Comments made on this post.',
        defaultColumns: ['author', 'content', 'createdAt'],
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
      name: 'commentsCount',
      label: 'Comments Count',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true, position: 'sidebar' },
    },

    {
      name: 'sharesCount',
      label: 'Shares Count',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true, position: 'sidebar' },
    },

    ownerField,

    // Freeform tags for search / classification
    {
      name: 'tags',
      type: 'array',
      fields: [{ name: 'tag', type: 'text' }],
    },
  ],
};
