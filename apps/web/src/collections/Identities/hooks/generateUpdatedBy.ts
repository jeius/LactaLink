import { Identity } from '@lactalink/types/payload-generated-types';
import { CollectionBeforeChangeHook } from 'payload';

export const generateUpdatedBy: CollectionBeforeChangeHook<Identity> = ({
  req,
  operation,
  data,
}) => {
  if (operation !== 'update' || data.updatedBy || !req.user) return data;

  const user = req.user;

  data.updatedBy = user.id;

  return data;
};
