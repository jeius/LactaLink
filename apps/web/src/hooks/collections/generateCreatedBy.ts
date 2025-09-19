import { CollectionWithCreatedBy } from '@lactalink/types/collections';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionBeforeChangeHook } from 'payload';

export const generateCreatedBy: CollectionBeforeChangeHook<CollectionWithCreatedBy> = ({
  req,
  operation,
  data,
}) => {
  if (operation !== 'create' || data.createdBy || !req.user) return data;
  data.createdBy = extractID(req.user);
  return data;
};
