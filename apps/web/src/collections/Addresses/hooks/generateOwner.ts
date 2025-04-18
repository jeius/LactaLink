import { Address } from '@lactalink/types';
import { CollectionBeforeChangeHook } from 'payload';

export const generateOwner: CollectionBeforeChangeHook<Address> = ({ req, operation, data }) => {
  // Only generate when operation is on create and there is no owner.
  if (operation !== 'create' || data.owner) return data;

  if (req.user && req.user.collection === 'users') {
    data.owner = req.user.id;
  }

  return data;
};
