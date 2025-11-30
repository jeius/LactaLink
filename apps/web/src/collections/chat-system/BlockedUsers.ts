import { CollectionConfig } from 'payload';

const BlockedUsers: CollectionConfig = {
  slug: 'blocked-users',
  admin: {
    useAsTitle: 'blocked',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      return {
        blocker: {
          equals: user.id,
        },
      };
    },
    create: ({ req: { user } }) => !!user,
    update: () => false,
    delete: ({ req: { user } }) => {
      if (!user) return false;
      return {
        blocker: {
          equals: user.id,
        },
      };
    },
  },
  fields: [
    {
      name: 'blocker',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'blocked',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
  ],
  indexes: [
    {
      fields: ['blocker', 'blocked'],
      unique: true,
    },
  ],
  hooks: {
    beforeChange: [
      async ({ req, operation, data }) => {
        if (!req.user) return data;

        if (operation === 'create') {
          data.blocker = req.user.id;

          // Prevent self-blocking
          if (data.blocker === data.blocked) {
            throw new Error('Cannot block yourself');
          }
        }

        return data;
      },
    ],
  },
  timestamps: true,
};

export default BlockedUsers;
