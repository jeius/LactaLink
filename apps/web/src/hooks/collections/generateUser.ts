import { Collection } from '@lactalink/types/collections';
import { User } from '@lactalink/types/payload-generated-types';
import { CollectionBeforeChangeHook } from 'payload';

type CollectionWithUser = Extract<Collection, { user: string | User }>;

export const generateUser: CollectionBeforeChangeHook<CollectionWithUser> = ({
  req,
  operation,
  data,
}) => {
  if (!req.user) return data;
  if (operation === 'create') {
    data.user = req.user.id;
  }
  return data;
};
