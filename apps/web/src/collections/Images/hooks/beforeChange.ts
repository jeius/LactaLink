import { Image } from '@/lib/types';
import { CollectionBeforeChangeHook } from 'payload';

export const generateAlt: CollectionBeforeChangeHook<Image> = ({ data, req, operation }) => {
  // Only generate when there is no alt and operation is on create.
  if (data.alt || operation !== 'create') return data;

  if (!req.user) return data;

  let name = 'anonymous-user';

  if (req.file) {
    name = req.user.email;
  }

  data.alt = `Photo uploaded by ${name}`;

  return data;
};

export const generateCreatedBy: CollectionBeforeChangeHook<Image> = ({ req, operation, data }) => {
  // Only generate when there is no createdBy and operation is on create
  if (data.createdBy || operation !== 'create') return data;

  if (req.file && req.user) {
    data.createdBy = { relationTo: req.user.collection, value: req.user.id };
  }

  return data;
};
