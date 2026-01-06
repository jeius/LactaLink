import { isAdmin } from '@/lib/utils/isAdmin';
import { extractID } from '@lactalink/utilities/extractors';
import { Access, Where } from 'payload';

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

export const collectionCreator: Access = ({ req }) => {
  const user = req.user;

  // If no user is logged in, deny access
  if (!user) return false;

  // If the collection has an owner, check if the user is the owner
  return {
    createdBy: { equals: user.id },
  };
};

export const collectionCreatorOrAdmin: Access = ({ req }) => {
  const user = req.user;

  // If no user is logged in, deny access
  if (!user) return false;

  // If the user is an admin, allow access
  if (isAdmin(user)) return true;

  // If the collection has an owner, check if the user is the owner
  return {
    createdBy: { equals: user.id },
  };
};

export const collectionCreatorProfileOrAdmin: Access = ({ req }) => {
  const user = req.user;

  // If no user is logged in, deny access
  if (!user) return false;

  // If the user is an admin, allow access
  if (isAdmin(user)) return true;

  const profile = user.profile;

  if (!profile) return false;

  // If the collection has an owner, check if the user is the owner
  return {
    and: [
      { 'createdBy.relationTo': { equals: profile.relationTo } },
      { 'createdBy.value': { equals: extractID(profile.value) } },
    ],
  } as Where;
};

export const collectionAuthorOrAdmin: Access = ({ req }) => {
  const user = req.user;

  // If no user is logged in, deny access
  if (!user) return false;

  // If the user is an admin, allow access
  if (isAdmin(user)) return true;

  const profile = user.profile;

  if (!profile) return false;

  return {
    and: [
      { 'author.relationTo': { equals: profile.relationTo } },
      { 'author.value': { equals: extractID(profile.value) } },
    ],
  } as Where;
};

/**
 * Access control for collections having transactions - only sender, recipient, or admin can access
 */
export const involvedPartiesOrAdmin: Access = ({ req: { user } }) => {
  if (!user) return false;

  if (isAdmin(user)) return true;

  if (!user.profile) return false;

  return {
    or: [
      {
        and: [
          { 'transaction.sender.value': { equals: extractID(user.profile.value) } },
          { 'transaction.sender.relationTo': { equals: user.profile.relationTo } },
        ],
      },
      {
        and: [
          { 'transaction.recipient.value': { equals: extractID(user.profile.value) } },
          { 'transaction.recipient.relationTo': { equals: user.profile.relationTo } },
        ],
      },
    ],
  } as Where;
};
