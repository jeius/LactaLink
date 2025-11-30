import { CollectionConfig } from 'payload/types';

const Conversations: CollectionConfig = {
  slug: 'conversations',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'lastMessageAt', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      // Users can only read conversations they're part of
      return {
        'participants.user': {
          equals: user.id,
        },
      };
    },
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => {
      if (!user) return false;
      // Only participants can update (e.g., change title)
      return {
        'participants.user': {
          equals: user.id,
        },
      };
    },
    delete: () => false, // Soft delete via 'archived' field
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'direct',
      options: [
        { label: 'Direct (1-to-1)', value: 'direct' },
        { label: 'Group', value: 'group' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Optional title for group chats',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Group chat avatar',
      },
    },
    {
      name: 'participants',
      type: 'relationship',
      relationTo: 'conversation-participants',
      hasMany: true,
      admin: {
        readOnly: true, // Managed via separate operations
      },
    },
    {
      name: 'lastMessage',
      type: 'relationship',
      relationTo: 'messages',
      admin: {
        readOnly: true, // Auto-updated via hook
      },
    },
    {
      name: 'lastMessageAt',
      type: 'date',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'archived',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ req, operation, data }) => {
        if (operation === 'create') {
          data.createdBy = req.user.id;
        }
        return data;
      },
    ],
    afterChange: [
      async ({ req, doc, operation }) => {
        // Emit to Supabase Realtime
        if (operation === 'create') {
          // Notify participants
          await req.payload.create({
            collection: 'notifications',
            data: {
              type: 'conversation_created',
              conversation: doc.id,
              triggeredBy: req.user.id,
            },
          });
        }
      },
    ],
  },
  timestamps: true,
};

export default Conversations;
