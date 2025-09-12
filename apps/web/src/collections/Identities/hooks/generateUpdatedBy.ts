import { Identity } from '@lactalink/types';
import { CollectionBeforeChangeHook } from 'payload';

export const generateUpdatedBy: CollectionBeforeChangeHook<Identity> = ({
  req,
  operation,
  data,
}) => {
  if (operation !== 'update' || data.updatedAt || !req.user) return data;

  const user = req.user;

  data.updatedAt = user.id;

  return data;
};
