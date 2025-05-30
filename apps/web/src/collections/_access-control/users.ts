import { isAdmin } from '@/lib/utils/isAdmin';
import { User } from '@lactalink/types';
import { Access } from 'payload';

// This file defines access control rules for the User collection in Payload CMS.

export const userOwner: Access<User> = ({ req }) => {
  const user = req.user;

  if (!user) return false; // If no user is logged in, deny access

  return { id: { equals: user.id } }; // Allow access if the user is the owner
};

export const userOwnerOrAdmin: Access<User> = ({ req }) => {
  const user = req.user;

  if (!user) return false; // If no user is logged in, deny access

  if (isAdmin(user)) return true; // If the user is an admin, allow access

  return { id: { equals: user.id } }; // Allow access if the user is the owner
};
