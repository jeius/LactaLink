import { CollectionConfig } from 'payload/types';

const MutedConversations: CollectionConfig = {
  slug: 'muted-conversations',
  admin: {
    useAsTitle: 'conversation',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      return {
        user: {
          equals: user.id,
        },
      };
    },
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => {
      if (!user) return false;
      return {
        user: {
          equals: user.id,
        },
      };
    },
    delete: ({ req: { user } }) => {
      if (!user) return false;
      return {
        user: {
          equals: user.id,
        },
      };
    },
  },
  fields: [
    {
      name: 'conversation',
      type: 'relationship',
      relationTo: 'conversations',
      required: true,
      index: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'mutedUntil',
      type: 'date',
      admin: {
        description: 'Leave empty for permanent mute',
      },
    },
  ],
  indexes: [
    {
      fields: {
        conversation: 1,
        user: 1,
      },
      options: {
        unique: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ req, operation, data }) => {
        if (operation === 'create') {
          data.user = req.user.id;
        }
        return data;
      },
    ],
  },
  timestamps: true,
};

export default MutedConversations;
