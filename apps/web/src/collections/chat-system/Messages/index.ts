import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { MESSAGE_TYPE } from '@lactalink/enums';
import { CollectionConfig } from 'payload';
import { authenticated } from '../../_access-control';
import { participants, senderOrAdmin } from './access';
import { updateLastMessage } from './hooks/afterChange';
import { verifySender } from './hooks/beforeChange';
import { deleteRelatedDocs } from './hooks/beforeDelete';

const Messages: CollectionConfig<'messages'> = {
  slug: 'messages',
  admin: {
    useAsTitle: 'content',
    defaultColumns: ['conversation', 'sender', 'content', 'createdAt'],
    group: COLLECTION_GROUP.CHAT,
  },
  trash: true,
  access: {
    read: participants,
    create: authenticated,
    update: senderOrAdmin,
    delete: senderOrAdmin,
  },
  indexes: [
    {
      fields: ['conversation', 'createdAt'],
    },
    {
      fields: ['searchVector'],
    },
  ],
  hooks: {
    beforeChange: [verifySender],
    beforeDelete: [deleteRelatedDocs],
    afterChange: [
      updateLastMessage,
      async ({ doc, operation, req }) => {
        if (operation === 'create') {
          // Emit to Supabase Realtime
          req.payload.logger.info(`[Realtime] New message in conversation ${doc.conversation}`);
          // TODO: Notify participants except sender
        }
        return doc;
      },
    ],
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
      type: 'row',
      fields: [
        {
          name: 'sender',
          type: 'relationship',
          relationTo: ['individuals', 'hospitals', 'milkBanks'],
          required: true,
          index: true,
          admin: {
            readOnly: true,
            width: '50%',
          },
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          enumName: 'enum_message_type',
          defaultValue: MESSAGE_TYPE.TEXT.value,
          options: Object.values(MESSAGE_TYPE),
          admin: {
            width: '50%',
          },
        },
      ],
    },

    {
      name: 'content',
      label: 'Message Content',
      type: 'textarea',
      admin: {
        description: 'The text content of the message',
      },
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
      relationTo: ['individuals', 'hospitals', 'milkBanks'],
      hasMany: true,
    },

    {
      name: 'edited',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'editedAt',
      type: 'date',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },

    {
      name: 'searchVector',
      type: 'text',
      admin: {
        hidden: true,
      },
    },

    {
      type: 'tabs',
      tabs: [
        {
          label: 'Attachments',
          fields: [
            {
              name: 'attachments',
              type: 'join',
              collection: 'message-attachments',
              on: 'message',
              admin: {
                description: 'Attachments associated with this message',
              },
            },
          ],
        },
        {
          label: 'Reactions',
          fields: [
            {
              name: 'reactions',
              type: 'join',
              collection: 'message-reactions',
              on: 'message',
              admin: {
                description: 'Reactions to this message',
              },
            },
          ],
        },
        {
          label: 'Replies',
          fields: [
            {
              name: 'replies',
              type: 'join',
              collection: 'messages',
              on: 'replyTo',
              admin: {
                description: 'Messages that are replies to this message',
                defaultColumns: ['conversation', 'sender', 'content', 'createdAt'],
              },
            },
          ],
        },
        {
          label: 'Reads',
          fields: [
            {
              name: 'reads',
              type: 'join',
              collection: 'message-reads',
              on: 'message',
              admin: {
                description: 'Read receipts for this message',
              },
            },
          ],
        },
      ],
    },
  ],
};

export default Messages;
