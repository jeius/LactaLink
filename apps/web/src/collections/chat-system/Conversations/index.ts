import { createdByField } from '@/fields/createdByField';
import { generateCreatedBy } from '@/hooks/collections/generateCreatedBy';
import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { CONVERSATION_TYPE } from '@lactalink/enums';
import { CollectionConfig, Field } from 'payload';
import { authenticated } from '../../_access-control';
import { allowedParticipantOrAdmin, participantOrAdmin } from './access';
import conversationEndpoints from './endpoints';
import { addFirstParticipant, createFirstGroupMessage } from './hooks/afterChange';

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
    delete: () => false, // Handle deletion via archive only
  },
  trash: true,
  endpoints: conversationEndpoints,
  hooks: {
    beforeChange: [generateCreatedBy],
    afterChange: [addFirstParticipant, createFirstGroupMessage],
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
      name: 'lastMessageAt',
      type: 'date',
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
              maxDepth: 5,
              defaultLimit: 10,
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
              maxDepth: 3,
              defaultLimit: 10,
              admin: {
                description: 'Messages in this conversation',
              },
            },
          ],
        },
        {
          label: 'Muted Statuses',
          fields: [
            {
              name: 'mutedStatuses',
              label: 'Muted Conversation Statuses',
              type: 'join',
              collection: 'conversation-statuses',
              on: 'conversation',
              maxDepth: 3,
              defaultLimit: 10,
              where: {
                or: [
                  { permanentMute: { equals: true } },
                  {
                    and: [
                      { mutedUntil: { exists: true } },
                      { mutedUntil: { greater_than: new Date().toISOString() } },
                    ],
                  },
                ],
              },
              admin: {
                description: 'Users who have muted this conversation',
              },
            },
          ],
        },
        {
          label: 'Archived',
          fields: [
            {
              name: 'archivedStatuses',
              label: 'Archived Conversation Statuses',
              type: 'join',
              collection: 'conversation-statuses',
              on: 'conversation',
              maxDepth: 3,
              defaultLimit: 10,
              where: { archived: { equals: true } },
              admin: {
                description: 'Users who have archived this conversation',
              },
            },
          ],
        },
      ],
    },
  ],
};

export default Conversations;
