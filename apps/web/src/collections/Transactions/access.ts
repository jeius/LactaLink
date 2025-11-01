import { isAdmin } from '@/lib/utils/isAdmin';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { Where } from '@lactalink/types/payload-types';
import { extractID } from '@lactalink/utilities/extractors';
import { Access } from 'payload';

export const involvedUsersOrAdmin: Access<Transaction> = ({ req }) => {
  const user = req.user;
  const userProfile = user?.profile;

  if (isAdmin(user)) return true;

  if (!userProfile) return false;

  return {
    or: [
      {
        and: [
          { 'sender.relationTo': { equals: userProfile.relationTo } },
          { 'sender.value': { equals: extractID(userProfile.value) } },
        ],
      },
      {
        and: [
          { 'recipient.relationTo': { equals: userProfile.relationTo } },
          { 'recipient.value': { equals: extractID(userProfile.value) } },
        ],
      },
    ],
  } as Where;
};
