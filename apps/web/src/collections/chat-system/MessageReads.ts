import { CollectionConfig } from 'payload/types';

const MessageReads: CollectionConfig = {
  slug: 'message-reads',
  admin: {
    useAsTitle: 'message',
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
    update: () => false, // Read receipts are immutable
    delete: () => false,
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
      name: 'readAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        readOnly: true,
      },
    },
  ],
  indexes: [
    {
      fields: {
        message: 1,
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

          // Prevent reading your own messages
          const message = await req.payload.findByID({
            collection: 'messages',
            id: data.message,
          });

          if (message.sender === req.user.id) {
            throw new Error('Cannot mark your own message as read');
          }
        }

        return data;
      },
    ],
    afterChange: [
      async ({ req, doc, operation }) => {
        if (operation === 'create') {
          // Emit to Supabase Realtime
          const message = await req.payload.findByID({
            collection: 'messages',
            id: doc.message,
          });

          console.log(`[Realtime] Message ${doc.message} read by ${doc.user} in conversation ${message.conversation}`);
        }
      },
    ],
  },
  timestamps: false,
};

export default MessageReads;
