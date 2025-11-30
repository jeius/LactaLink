import { CollectionConfig } from 'payload/types';

const MessageReactions: CollectionConfig = {
  slug: 'message-reactions',
  admin: {
    useAsTitle: 'emoji',
  },
  access: {
    read: ({ req: { user } }) => !!user,
    create: ({ req: { user } }) => !!user,
    update: () => false,
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
      name: 'message',
      type: 'relationship',
      relationTo: 'messages',
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
      name: 'emoji',
      type: 'text',
      required: true,
      maxLength: 10,
      validate: (value) => {
        // Basic emoji validation
        const emojiRegex = /^[\u{1F300}-\u{1F9FF}]$/u;
        if (!emojiRegex.test(value)) {
          return 'Invalid emoji';
        }
        return true;
      },
    },
  ],
  indexes: [
    {
      fields: {
        message: 1,
        user: 1,
        emoji: 1,
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
    afterChange: [
      async ({ req, doc, operation }) => {
        if (operation === 'create') {
          console.log(`[Realtime] Reaction ${doc.emoji} added to message ${doc.message}`);
        }
      },
    ],
  },
  timestamps: true,
};

export default MessageReactions;
