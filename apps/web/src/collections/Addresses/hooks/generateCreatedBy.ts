import { Address } from '@/lib/types';
import { CollectionBeforeChangeHook } from 'payload';

export const generateCreatedBy: CollectionBeforeChangeHook<Address> = ({
  req,
  operation,
  data,
}) => {
  // Only generate when there is no createdBy and operation is on create
  if (data.createdBy || operation !== 'create') return data;

  if (req.user) {
    data.createdBy = { relationTo: req.user.collection, value: req.user.id };
  }

  return data;
};
