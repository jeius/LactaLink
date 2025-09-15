import { MILK_BAG_STATUS } from '@lactalink/enums';
import { MilkBag } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionBeforeValidateHook } from 'payload';

export const initializeMilkBag: CollectionBeforeValidateHook<MilkBag> = async ({
  data,
  operation,
}) => {
  if (operation !== 'create' || !data) {
    return data;
  }

  // Set collectedAt to current date if not provided
  if (!data.collectedAt) {
    data.collectedAt = new Date().toISOString();
  }

  // Set owner to the donor if not provided
  if (data.donor && !data.owner) {
    // If donor is provided, set owner to donor
    data.owner = { relationTo: 'individuals', value: extractID(data.donor) };
  }

  if (!data.bagImage && !data.status) {
    data.status = MILK_BAG_STATUS.DRAFT.value;
  }

  return data;
};
