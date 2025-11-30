import { CollectionConfig } from 'payload/types';

const ConversationParticipants: CollectionConfig = {
  slug: 'conversation-participants',
  admin: {
    useAsTitle: 'user',
    defaultColumns: ['conversation', 'user', 'role', 'joinedAt'],
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
      // Only admins can change roles
      return {
        or: [
          {
            user: {
              equals: user.id,
            },
            role: {
              equals: 'admin',
            },
          },
        ],
      };
    },
    delete: ({ req: { user } }) => {
      if (!user) return false;
      // Users can leave, admins can remove others
      return true; // Validation in beforeChange hook
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
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'member',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Moderator', value: 'moderator' },
        { label: 'Member', value: 'member' },
      ],
    },
    {
      name: 'joinedAt',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'leftAt',
      type: 'date',
      admin: {
        description: 'Soft delete - when user left the conversation',
      },
    },
    {
      name: 'addedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        readOnly: true,
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
    beforeValidate: [
      async ({ req, operation, data }) => {
        // Prevent duplicate participants
        if (operation === 'create') {
          const existing = await req.payload.find({
            collection: 'conversation-participants',
            where: {
              and: [
                { conversation: { equals: data.conversation } },
                { user: { equals: data.user } },
                { leftAt: { exists: false } },
              ],
            },
          });

          if (existing.totalDocs > 0) {
            throw new Error('User is already a participant');
          }
        }
      },
    ],
    beforeChange: [
      async ({ req, operation, data }) => {
        if (operation === 'create') {
          data.addedBy = req.user.id;
        }

        // Validate permissions for role changes
        if (operation === 'update' && data.role) {
          const participant = await req.payload.findByID({
            collection: 'conversation-participants',
            id: data.id,
          });

          if (participant.user !== req.user.id) {
            // Check if requester is admin
            const requesterParticipant = await req.payload.find({
              collection: 'conversation-participants',
              where: {
                and: [
                  { conversation: { equals: participant.conversation } },
                  { user: { equals: req.user.id } },
                  { role: { equals: 'admin' } },
                ],
              },
            });

            if (requesterParticipant.totalDocs === 0) {
              throw new Error('Only admins can change participant roles');
            }
          }
        }

        return data;
      },
    ],
    afterChange: [
      async ({ req, doc, operation }) => {
        // Emit real-time event
        if (operation === 'create') {
          // Notify conversation channel
          console.log(`[Realtime] User ${doc.user} joined conversation ${doc.conversation}`);
        }
      },
    ],
  },
  timestamps: true,
};

export default ConversationParticipants;
