import { isAdmin } from '@/lib/utils/isAdmin';
import { extractID } from '@lactalink/utilities/extractors';
import { Access, Where } from 'payload';

export const senderOrAdmin: Access = ({ req: { user } }) => {
  const profile = user?.profile;
  if (!profile) return false;
  if (isAdmin(user)) return true;
  return {
    and: [
      { 'sender.relationTo': { equals: profile.relationTo } },
      { 'sender.value': { equals: extractID(profile.value) } },
    ],
  } as Where;
};

export const participants: Access = async ({ req: { user }, req }) => {
  if (!user) return false;
  if (isAdmin(user)) return true;

  const { values } = await req.payload.findDistinct({
    collection: 'conversation-participants',
    where: { participant: { equals: user.id } },
    limit: 0,
    depth: 0,
    req,
    field: 'conversation',
    sort: 'conversation',
  });

  const ids = values.map((p) => extractID(p.conversation));

  // Users can only read messages from conversations they're part of
  return { conversation: { in: ids } };
};
