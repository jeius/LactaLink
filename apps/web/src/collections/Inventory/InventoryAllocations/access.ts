import { isAdmin } from '@/lib/utils/isAdmin';
import { Access, Where } from 'payload';
import { extractID } from 'payload/shared';

/**
 * Collection-level read: the owning organization OR the recipient (requester) can read.
 * Write access (create/update/trash) is restricted to the owning organization.
 */
export const allocationReadAccess: Access = ({ req }) => {
  const user = req.user;
  if (!user) return false;
  if (isAdmin(user)) return true;

  const profile = user.profile;
  if (!profile) return false;

  const profileId = extractID(profile.value);

  return {
    or: [
      // Organization that owns the linked inventory
      {
        and: [
          { 'inventory.organization.relationTo': { equals: profile.relationTo } },
          { 'inventory.organization.value': { equals: profileId } },
        ],
      },
      // Requester who placed the linked request
      {
        and: [{ 'request.requester': { equals: profileId } }],
      },
    ],
  } as Where;
};

/**
 * Write access: only the owning organization (inventory.organization) or admin.
 */
export const allocationWriteAccess: Access = ({ req }) => {
  const user = req.user;
  if (!user) return false;
  if (isAdmin(user)) return true;

  const profile = user.profile;
  if (!profile) return false;

  return {
    and: [
      { 'inventory.organization.relationTo': { equals: profile.relationTo } },
      { 'inventory.organization.value': { equals: extractID(profile.value) } },
    ],
  } as Where;
};
