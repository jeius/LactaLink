import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { isAdmin } from '@/lib/utils/isAdmin';
import { CONVERSATION_ROLE } from '@lactalink/enums';
import { CollectionConfig, Where } from 'payload';
import { authenticated } from '../_access-control';
import { validateParticipantPermissions } from './_hooks/beforeChangeParticipants';
import { preventDuplicateParticipants } from './_hooks/beforeValidateParticipants';
import { getUserConversationIds } from './_utils/getConversationIds';

const ConversationParticipants: CollectionConfig<'conversation-participants'> = {
  slug: 'conversation-participants',
  trash: true,
  labels: { singular: 'Conversation Participant', plural: 'Conversation Participants' },
  admin: {
    useAsTitle: 'participant',
    defaultColumns: ['conversation', 'participant', 'role', 'createdAt'],
    group: COLLECTION_GROUP.CHAT,
    hidden: true,
  },
  access: {
    create: authenticated,
    read: authenticated,
    // read: async ({ req: { user }, req }) => {
    //   if (!user) return false;
    //   if (isAdmin(user)) return true;

    //   const conversationIds = await getUserConversationIds(req);
    //   // Can read if they are a participant in the conversation or if the conversation includes them
    //   if (conversationIds.length > 0) return { conversation: { in: conversationIds } } as Where;

    //   return { participant: { equals: user.id } };
    // },
    update: async ({ req: { user }, req }) => {
      if (!user) return false;
      if (isAdmin(user)) return true;

      const adminConversationIds = await getUserConversationIds(req, 'ADMIN');
      // Can update if they are an admin in the conversation
      if (adminConversationIds.length > 0) return { conversation: { in: adminConversationIds } };

      return false;
    },
    delete: async ({ req: { user }, req }) => {
      if (!user) return false;
      if (isAdmin(user)) return true;

      const query: Where[] = [{ participant: { equals: user.id } }];

      const adminConversationIds = await getUserConversationIds(req, 'ADMIN');
      if (adminConversationIds.length > 0) {
        query.push({ conversation: { in: adminConversationIds } });
      }

      return { or: query };
    },
  },
  indexes: [
    {
      fields: ['conversation', 'participant'],
      unique: true,
    },
  ],
  hooks: {
    beforeValidate: [preventDuplicateParticipants],
    beforeChange: [validateParticipantPermissions],
    afterChange: [
      async ({ req, doc, operation }) => {
        // Emit real-time event
        if (operation === 'create') {
          // Notify conversation channel
          req.payload.logger.info(
            `[Realtime] User ${doc.user} joined conversation ${doc.conversation}`
          );
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
      name: 'participant',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: CONVERSATION_ROLE.MEMBER.value,
      options: Object.values(CONVERSATION_ROLE),
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
};

export default ConversationParticipants;
