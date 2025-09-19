import { CollectionWithOwner } from '@lactalink/types/collections';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionBeforeChangeHook } from 'payload';

export const generateOwner: CollectionBeforeChangeHook<CollectionWithOwner> = ({
  req,
  operation,
  data,
}) => {
  if (operation !== 'create' || data.owner || !req.user) return data;
  data.owner = extractID(req.user);
  return data;
};
