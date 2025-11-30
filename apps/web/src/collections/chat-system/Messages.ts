import { CollectionConfig } from 'payload';

const Messages: CollectionConfig = {
  slug: 'messages',
  admin: {
    useAsTitle: 'content',
    defaultColumns: ['conversation', 'sender', 'content', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      // Users can only read messages from conversations they're part of
      return {
        'conversation.participants.user': {
          equals: user.id,
        },
      };
    },
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => {
      if (!user) return false;
      // Only sender can edit their own messages
      return {
        sender: {
          equals: user.id,
        },
      };
    },
    delete: ({ req: { user } }) => {
      if (!user) return false;
      return {
        sender: {
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
      name: 'sender',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      maxLength: 10000,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'text',
      options: [
        { label: 'Text', value: 'text' },
        { label: 'System', value: 'system' },
        { label: 'Attachment', value: 'attachment' },
      ],
    },
    {
      name: 'attachments',
      type: 'relationship',
      relationTo: 'message-attachments',
      hasMany: true,
    },
    {
      name: 'replyTo',
      type: 'relationship',
      relationTo: 'messages',
      admin: {
        description: 'Message this is replying to (threading)',
      },
    },
    {
      name: 'mentions',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
    },
    {
      name: 'edited',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'editedAt',
      type: 'date',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'deleted',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Soft delete',
      },
    },
    {
      name: 'deletedAt',
      type: 'date',
    },
    {
      name: 'searchVector',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
  ],
  indexes: [
    {
      fields: {
        conversation: 1,
        createdAt: -1,
      },
    },
    {
      fields: {
        searchVector: 'text',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ req, operation, data, originalDoc }) => {
        if (operation === 'create') {
          data.sender = req.user.id;

          // Verify sender is participant
          const participant = await req.payload.find({
            collection: 'conversation-participants',
            where: {
              and: [
                { conversation: { equals: data.conversation } },
                { user: { equals: req.user.id } },
                { leftAt: { exists: false } },
              ],
            },
          });

          if (participant.totalDocs === 0) {
            throw new Error('You are not a participant in this conversation');
          }

          // Check for blocked users
          const blocked = await req.payload.find({
            collection: 'blocked-users',
            where: {
              or: [
                {
                  and: [
                    { blocker: { equals: req.user.id } },
                    { 'conversation.participants.user': { in: [data.conversation] } },
                  ],
                },
                {
                  and: [
                    { blocked: { equals: req.user.id } },
                    { 'conversation.participants.user': { in: [data.conversation] } },
                  ],
                },
              ],
            },
          });

          if (blocked.totalDocs > 0) {
            throw new Error('Cannot send message to blocked user');
          }
        }

        if (operation === 'update') {
          if (originalDoc.content !== data.content) {
            data.edited = true;
            data.editedAt = new Date().toISOString();
          }

          if (data.deleted && !originalDoc.deleted) {
            data.deletedAt = new Date().toISOString();
          }
        }

        if (operation === 'create' || operation === 'update') {
          // Create search vector from content + sender name
          data.searchVector = `${data.content}`.toLowerCase();
        }

        return data;
      },
    ],
    afterChange: [
      async ({ req, doc, operation }) => {
        if (operation === 'create' && !doc.deleted) {
          // Update conversation's lastMessage and lastMessageAt
          await req.payload.update({
            collection: 'conversations',
            id: doc.conversation,
            data: {
              lastMessage: doc.id,
              lastMessageAt: doc.createdAt,
            },
          });

          // Emit to Supabase Realtime
          console.log(`[Realtime] New message in conversation ${doc.conversation}`);

          // Trigger push notifications
          const participants = await req.payload.find({
            collection: 'conversation-participants',
            where: {
              and: [
                { conversation: { equals: doc.conversation } },
                { user: { not_equals: doc.sender } },
                { leftAt: { exists: false } },
              ],
            },
          });

          for (const participant of participants.docs) {
            await req.payload.create({
              collection: 'notifications',
              data: {
                type: 'new_message',
                user: participant.user,
                message: doc.id,
                conversation: doc.conversation,
              },
            });
          }
        }
      },
    ],
  },
  timestamps: true,
};

export default Messages;
