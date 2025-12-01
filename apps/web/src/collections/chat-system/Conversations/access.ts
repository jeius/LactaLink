import { isAdmin } from '@/lib/utils/isAdmin';
import { CONVERSATION_ROLE } from '@lactalink/enums';
import { Conversation } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { Access } from 'payload';

export const participantOrAdmin: Access<Conversation> = async ({ req: { user }, req }) => {
  if (!user) return false;
  if (isAdmin(user)) return true;

  const participants = await req.payload.findDistinct({
    req,
    collection: 'conversation-participants',
    depth: 0,
    field: 'conversation',
    sort: 'conversation',
    where: { participant: { equals: user.id } },
  });

  const conversationIds = participants.values.map((p) => extractID(p.conversation));
  return { id: { in: conversationIds } };
};

export const allowedParticipantOrAdmin: Access<Conversation> = async ({ req: { user }, req }) => {
  if (!user) return false;
  if (isAdmin(user)) return true;

  const allowedRoles = [CONVERSATION_ROLE.ADMIN.value, CONVERSATION_ROLE.MODERATOR.value];

  const participants = await req.payload.findDistinct({
    req,
    collection: 'conversation-participants',
    depth: 0,
    field: 'conversation',
    sort: 'conversation',
    where: {
      and: [{ participant: { equals: user.id } }, { role: { in: allowedRoles } }],
    },
  });

  const conversationIds = participants.values.map((p) => extractID(p.conversation));
  return { id: { in: conversationIds } };
};
