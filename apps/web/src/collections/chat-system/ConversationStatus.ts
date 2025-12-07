import { generateUser } from '@/hooks/collections/generateUser';
import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { CollectionConfig } from 'payload';
import { authenticated, userOrAdmin } from '../_access-control';

const ConversationStatus: CollectionConfig<'conversation-statuses'> = {
  slug: 'conversation-statuses',
  admin: {
    useAsTitle: 'conversation',
    group: COLLECTION_GROUP.CHAT,
    hidden: true,
  },
  access: {
    read: userOrAdmin,
    create: authenticated,
    update: userOrAdmin,
    delete: userOrAdmin,
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
      name: 'archived',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        description: 'Whether the user has archived this conversation',
      },
    },
    {
      name: 'permanentMute',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        description: 'Whether the user has muted this conversation permanently',
      },
    },
    {
      name: 'mutedUntil',
      type: 'date',
      index: true,
      admin: {
        description: 'If set, the conversation is muted until this date/time',
        condition: (_, { permanentMute }) => !permanentMute,
      },
    },
  ],
  indexes: [
    {
      fields: ['conversation', 'user'],
      unique: true,
    },
  ],
  hooks: {
    beforeChange: [generateUser],
  },
};

export default ConversationStatus;
