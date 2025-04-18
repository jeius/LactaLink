import { Avatar } from '@lactalink/types';
import { CollectionBeforeChangeHook } from 'payload';

export const generateAlt: CollectionBeforeChangeHook<Avatar> = ({ data, operation, req }) => {
  // Only generate when there is no alt and operation is on create.
  if (data.alt || operation !== 'create') return data;

  if (!req.user) return data;

  let name = 'anonymous-user';

  if (req.file) {
    name = req.user.email;
  }

  data.alt = `Avatar of ${name}`;

  return data;
};

export const generateOwner: CollectionBeforeChangeHook<Avatar> = ({ req, operation, data }) => {
  if (operation === 'create' && req.file && req.user) {
    if (!data.owner) {
      data.owner = { relationTo: req.user.collection, value: req.user.id };
    }
  }

  return data;
};
