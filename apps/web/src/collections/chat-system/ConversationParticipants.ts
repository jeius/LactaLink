import { COLLECTION_GROUP } from '@/lib/constants/collections';
import { isAdmin } from '@/lib/utils/isAdmin';
import { CONVERSATION_ROLE } from '@lactalink/enums';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionConfig, Where } from 'payload';
import { authenticated } from '../_access-control';
import { preventDuplicateParticipants } from './_hooks/beforeValidateParticipants';

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
    read: async ({ req: { user }, req }) => {
      if (!user) return false;
      if (isAdmin(user)) return true;
      // Users can only see participants of conversations they're part of
      const { values } = await req.payload.findDistinct({
        req,
        collection: 'conversation-participants',
        depth: 0,
        field: 'conversation',
        sort: 'conversation',
        where: { participant: { equals: user.id } },
      });

      const conversationIds = values.map((p) => extractID(p.conversation));
      return { conversation: { in: conversationIds } };
    },
    update: async ({ req: { user }, req }) => {
      if (!user) return false;
      if (isAdmin(user)) return true;
      // Users can update their own roles only if they are admins in the conversation
      const { values } = await req.payload.findDistinct({
        req,
        collection: 'conversation-participants',
        depth: 0,
        field: 'conversation',
        sort: 'conversation',
        where: {
          and: [
            { participant: { equals: user.id } },
            { role: { equals: CONVERSATION_ROLE.ADMIN.value } },
          ],
        },
      });

      const conversationIds = values.map((p) => extractID(p.conversation));
      return { conversation: { in: conversationIds } };
    },
    delete: async ({ req: { user }, req }) => {
      if (!user) return false;
      if (isAdmin(user)) return true;
      // Users can leave, admins can remove others
      const { values } = await req.payload.findDistinct({
        req,
        collection: 'conversation-participants',
        depth: 0,
        field: 'conversation',
        sort: 'conversation',
        where: {
          and: [
            { participant: { equals: user.id } },
            { role: { equals: CONVERSATION_ROLE.ADMIN.value } },
          ],
        },
      });

      const conversationIds = values.map((p) => extractID(p.conversation));
      const query: Where[] = [{ participant: { equals: user.id } }];
      if (conversationIds.length > 0) {
        query.push({ conversation: { in: conversationIds } });
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
