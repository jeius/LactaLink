import { createdByField } from '@/fields/createdByField';
import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { CONVERSATION_TYPE } from '@lactalink/enums';
import { CollectionConfig, Field } from 'payload';
import { authenticated } from '../../_access-control';
import { allowedParticipantOrAdmin, participantOrAdmin } from './access';

export const Conversations: CollectionConfig<'conversations'> = {
  slug: 'conversations',
  labels: { singular: 'Conversation', plural: 'Conversations' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'lastMessageAt', 'createdAt'],
    group: COLLECTION_GROUP.CHAT,
  },
  access: {
    read: participantOrAdmin,
    create: authenticated,
    update: allowedParticipantOrAdmin,
    delete: () => false,
  },
  trash: true,
  hooks: {
    beforeChange: [generateCreatedBy],
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      enumName: 'enum_conversation_type',
      defaultValue: CONVERSATION_TYPE.DIRECT.value,
      options: Object.values(CONVERSATION_TYPE),
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
      relationTo: 'avatars',
      admin: {
        description: 'Group chat avatar',
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

    { ...createdByField, required: true } as Field,

    {
      type: 'tabs',
      tabs: [
        {
          label: 'Participants',
          fields: [
            {
              name: 'participants',
              label: 'Conversation Participants',
              type: 'join',
              collection: 'conversation-participants',
              on: 'conversation',
              admin: {
                description: 'Participants in this conversation',
              },
            },
          ],
        },
        {
          label: 'Messages',
          fields: [
            {
              name: 'messages',
              type: 'join',
              collection: 'messages',
              on: 'conversation',
              defaultSort: '-createdAt',
              admin: {
                description: 'Messages in this conversation',
              },
            },
          ],
        },
      ],
    },
  ],
};

export default Conversations;
