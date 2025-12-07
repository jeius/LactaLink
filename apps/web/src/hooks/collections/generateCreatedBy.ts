import {
  CollectionWithCreatedBy,
  CollectionWithCreatedByProfile,
} from '@lactalink/types/collections';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionBeforeChangeHook } from 'payload';

export const generateCreatedBy: CollectionBeforeChangeHook<CollectionWithCreatedBy> = ({
  req,
  operation,
  data,
}) => {
  if (operation !== 'create' || !req.user) return data;
  if (!data.createdBy || data.createdBy === '') {
    data.createdBy = extractID(req.user);
  }
  return data;
};

export const generateCreatedByProfile: CollectionBeforeChangeHook<
  CollectionWithCreatedByProfile
> = ({ req, operation, data }) => {
  if (operation !== 'create' || data.createdBy || !req.user?.profile) return data;
  data.createdBy = {
    relationTo: req.user.profile.relationTo,
    value: extractID(req.user.profile.value),
  };
  return data;
};
