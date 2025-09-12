import { CollectionWithOwner } from '@/lib/types';
import { CollectionBeforeChangeHook } from 'payload';

export const generateOwner: CollectionBeforeChangeHook<CollectionWithOwner> = ({
  req,
  operation,
  data,
}) => {
  if (operation !== 'create' || data.owner || !req.user) return data;
  data.owner = req.user;
  return data;
};
