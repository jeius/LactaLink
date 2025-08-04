import { Request } from '@lactalink/types';
import _ from 'lodash';
import { CollectionBeforeChangeHook } from 'payload';
import { updateVolumeFields } from '../utils/updateVolumeFields';

export const updateVolume: CollectionBeforeChangeHook<Request> = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  // Only update volume if the request is being updated and the milk bags have changed
  // This prevents unnecessary updates when the same bags are selected
  if (
    operation !== 'update' ||
    !originalDoc ||
    _.isEqual(data.details?.bags, originalDoc.details?.bags)
  ) {
    return data;
  }

  return updateVolumeFields(req, data);
};
