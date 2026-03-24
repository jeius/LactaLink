import { isAdmin } from '@/lib/utils/isAdmin';
import { Access, Where } from 'payload';
import { extractID } from 'payload/shared';

export const adminOrInvolvedParties: Access = async ({ req }) => {
  const user = req.user;
  if (!user) return false;

  // Admins can access all events
  if (isAdmin(user)) return true;

  // For non-admins, check if they are involved in the event
  const profile = user.profile;
  if (!profile) return false;

  const profileID = extractID(profile.value);
  const profileSlug = profile.relationTo;

  return {
    or: [
      { performedBy: { equals: user.id } },
      {
        and: [
          { organization: { exists: true } },
          { 'organization.value': { equals: profileID } },
          { 'organization.relationTo': { equals: profileSlug } },
        ],
      },
      {
        and: [
          { fromParty: { exists: true } },
          { 'fromParty.value': { equals: profileID } },
          { 'fromParty.relationTo': { equals: profileSlug } },
        ],
      },
      {
        and: [
          { toParty: { exists: true } },
          { 'toParty.value': { equals: profileID } },
          { 'toParty.relationTo': { equals: profileSlug } },
        ],
      },
    ],
  } as Where;
};
