import { Collections, User } from '@lactalink/types';
import { CollectionBeforeChangeHook } from 'payload';

// Base type for any collection that may have an owner field
type CollectionWithOwner = Extract<
  Collections,
  {
    owner?: string | User | null;
  }
>;

export const generateOwner: CollectionBeforeChangeHook<CollectionWithOwner> = ({
  req,
  operation,
  data,
}) => {
  if (operation !== 'create' || data.owner || !req.user) return data;

  const user = req.user;

  data.owner = user.id;

  return data;
};
