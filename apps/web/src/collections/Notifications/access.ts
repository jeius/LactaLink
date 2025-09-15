import { isAdmin } from '@/lib/utils/isAdmin';
import { Access } from 'payload';

export const recipientOrAdmin: Access = ({ req }) => {
  const user = req.user;

  // If no user is logged in, deny access
  if (!user) return false;

  if (isAdmin(user)) return true;

  return {
    recipient: { equals: user.id },
  };
};
