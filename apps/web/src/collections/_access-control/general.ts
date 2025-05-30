import { isAdmin } from '@/lib/utils/isAdmin';
import { Access } from 'payload';

// This file defines general access control rules for collections in Payload CMS.

export const anyone: Access = () => true;

export const authenticated: Access = ({ req }) => Boolean(req.user);

export const collectionOwner: Access = ({ req }) => {
  const user = req.user;

  // If no user is logged in, deny access
  if (!user) return false;

  // If the collection has an owner, check if the user is the owner
  return {
    owner: { equals: user.id },
  };
};

export const collectionOwnerOrAdmin: Access = ({ req }) => {
  const user = req.user;

  // If no user is logged in, deny access
  if (!user) return false;

  // If the user is an admin, allow access
  if (isAdmin(user)) return true;

  // If the collection has an owner, check if the user is the owner
  return {
    owner: { equals: user.id },
  };
};
