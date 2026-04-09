import { isAdmin } from '@/lib/utils/isAdmin';
import { extractID } from '@lactalink/utilities/extractors';
import { Access, Where } from 'payload';

export const organizationOrAdmin: Access = ({ req: { user } }) => {
  if (!user) return false;

  if (isAdmin(user)) return true;

  switch (user.profileType) {
    case 'HOSPITAL':
    case 'MILK_BANK':
      return true;
    default:
      return false;
  }
};

export const associateOrganizationOrAdmin: Access = ({ req: { user } }) => {
  if (!user) return false;

  if (isAdmin(user)) return true;

  const profile = user.profile;
  if (!profile) return false;

  if (profile.relationTo === 'hospitals') {
    return { hospital: { equals: extractID(profile.value) } } as Where;
  } else if (profile.relationTo === 'milkBanks') {
    return { milkbank: { equals: extractID(profile.value) } } as Where;
  }

  return false;
};

export const authenticatedAndPublished: Access = ({ req: { user } }) => {
  if (!user) return false;

  const profile = user.profile;

  if (profile) {
    return {
      or: [
        // Allow access to published forms for all authenticated users
        { _status: { equals: 'published' } },
        // Allow users to access their own drafts
        {
          and: [
            { _status: { equals: 'draft' } },
            {
              or: [
                { hospital: { equals: extractID(profile.value) } },
                { milkbank: { equals: extractID(profile.value) } },
              ],
            },
          ],
        },
      ],
    } as Where;
  }

  return { _status: { equals: 'published' } } as Where;
};

export const submitterOrAdmin: Access = ({ req: { user } }) => {
  if (!user) return false;

  if (isAdmin(user)) return true;

  return { submittedBy: { equals: user.id } };
};
