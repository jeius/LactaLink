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

export const participants: Access = ({ req: { user } }) => {
  if (!user) return false;
  if (isAdmin(user)) return true;
  // Users can only read messages from conversations they're part of
  return {
    'conversation.participants.participant': { equals: user.id },
  };
};
