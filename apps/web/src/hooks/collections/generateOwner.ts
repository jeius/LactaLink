import { CollectionWithOwner } from '@/lib/types';
import { CollectionBeforeChangeHook } from 'payload';

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
