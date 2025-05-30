import { CollectionWithCreatedBy } from '@/lib/types';
import { CollectionBeforeChangeHook } from 'payload';

export const generateCreatedBy: CollectionBeforeChangeHook<CollectionWithCreatedBy> = ({
  req,
  operation,
  data,
}) => {
  if (operation !== 'create' || data.createdBy || !req.user) return data;

  const user = req.user;

  data.createdBy = user.id;

  return data;
};
