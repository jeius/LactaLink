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

export const associatedOrgOrAdmin: Access = ({ req: { user } }) => {
  if (!user) return false;

  if (isAdmin(user)) return true;

  const profile = user.profile;
  if (!profile) return false;
  return {
    and: [
      { 'organization.value': { equals: extractID(profile.value) } },
      { 'organization.relationTo': { equals: profile.relationTo } },
    ],
  } as Where;
};

export const authenticatedAndPublished: Access = ({ req: { user } }) => {
  if (!user) return false;

  if (isAdmin(user)) return true;

  const filters: Where[] = [{ _status: { equals: 'published' } }];

  const profile = user.profile;

  if (profile && profile.relationTo !== 'individuals') {
    filters.push({
      and: [
        { _status: { equals: 'draft' } },
        { 'organization.value': { equals: extractID(profile.value) } },
        { 'organization.relationTo': { equals: profile.relationTo } },
      ],
    });
  }

  return { or: filters } as Where;
};

export const submitterOrAdmin: Access = ({ req: { user } }) => {
  if (!user) return false;

  if (isAdmin(user)) return true;

  return { submittedBy: { equals: user.id } };
};

export const submitterOrAssociatedOrgOrAdmin: Access = ({ req: { user } }) => {
  if (!user) return false;

  if (isAdmin(user)) return true;

  // Allow users to access their own submissions
  const filters: Where[] = [{ submittedBy: { equals: user.id } }];

  // If the user is an organization where the submission was submitted to, allow them
  // to access the published only.
  const profile = user.profile;
  if (profile && profile.relationTo !== 'individuals') {
    filters.push({
      and: [
        { 'form.organization.value': { equals: extractID(profile.value) } },
        { 'form.organization.relationTo': { equals: profile.relationTo } },
        { _status: { equals: 'published' } },
      ],
    });
  }

  return { or: filters } as Where;
};
