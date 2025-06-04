import { Request } from '@lactalink/types';
import { CollectionBeforeChangeHook } from 'payload';

export const updateStatus: CollectionBeforeChangeHook<Request> = async ({
  data,
  operation,
  originalDoc,
  context,
  req,
}) => {
  if (operation === 'create' && data.matchedDonation) {
    data.status = 'MATCHED';
    data.matchedAt = new Date().toISOString();

    context.updateMilkBag = true; // Indicate that milk bags should be updated after creation
  } else if (operation === 'update' && !originalDoc?.matchedDonation && data.matchedDonation) {
    data.status = 'MATCHED';
    data.matchedAt = new Date().toISOString();

    context.updateMilkBag = true; // Indicate that milk bags should be updated after update
  }

  return data;
};
