import { Avatar } from '@lactalink/types/payload-generated-types';
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
