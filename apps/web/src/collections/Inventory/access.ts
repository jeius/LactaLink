import { isAdmin } from '@/lib/utils/isAdmin';
import { extractID } from '@lactalink/utilities/extractors';
import { Access, Where } from 'payload';

/**
 * Collection-level write access for Inventory — only the owning organization or admin.
 * Returns a Where constraint so list queries are also scoped.
 */
export const inventoryOwnerOrAdminWrite: Access = ({ req }) => {
  const user = req.user;
  if (!user) return false;
  if (isAdmin(user)) return true;

  const profile = user.profile;
  if (!profile) return false;

  return {
    and: [
      { 'organization.relationTo': { equals: profile.relationTo } },
      { 'organization.value': { equals: extractID(profile.value) } },
    ],
  } as Where;
};
