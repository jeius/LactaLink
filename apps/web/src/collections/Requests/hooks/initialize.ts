import { Request } from '@lactalink/types/payload-generated-types';
import { CollectionBeforeValidateHook } from 'payload';
import { updateVolumeFields } from '../utils/updateVolumeFields';

export const initializeRequest: CollectionBeforeValidateHook<Request> = async ({
  data,
  req,
  operation,
}) => {
  if (operation !== 'create' || !data) return data;

  if (!data.details?.bags?.length || !data.volumeNeeded) {
    data.volumeFulfilled = 0;
    return data;
  }

  const updatedData = await updateVolumeFields(req, data);

  return updatedData;
};
