import { Request } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import isEqual from 'lodash/isEqual';
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
    isEqual(extractID(data.details?.bags), extractID(originalDoc.details?.bags))
  ) {
    return data;
  }

  return updateVolumeFields(req, data);
};
