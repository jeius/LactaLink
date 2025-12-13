import { isAdmin } from '@/lib/utils/isAdmin';
import { Access, Where } from 'payload';

export const involvedUserOrAdmin: Access = ({ req }) => {
  if (!req.user) return false;

  if (isAdmin(req.user)) return true;

  const profile = req.user.profile;
  if (!profile) return false;

  return {
    or: [
      {
        and: [
          { 'deliveryDetails.transaction.sender.value': { equals: profile.value } },
          { 'deliveryDetails.transaction.sender.relationTo': { equals: profile.relationTo } },
        ],
      },
      {
        and: [
          { 'deliveryDetails.transaction.recipient.value': { equals: profile.value } },
          { 'deliveryDetails.transaction.recipient.relationTo': { equals: profile.relationTo } },
        ],
      },
    ],
  } as Where;
};
