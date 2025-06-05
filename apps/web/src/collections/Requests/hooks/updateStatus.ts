import { Request } from '@lactalink/types';
import { CollectionBeforeChangeHook } from 'payload';

export const updateStatus: CollectionBeforeChangeHook<Request> = async ({
  data,
  operation,
  originalDoc,
  context,
  req,
}) => {
  if (context.skipRequestUpdateHook) {
    req.payload.logger.info(
      { requestId: originalDoc?.id },
      'Skipping request status update due to context flag'
    );
    context.updateMilkBag = false; // Ensure milk bag update is not triggered
    return data; // Skip status update if the flag is set
  }

  if (operation === 'create' && data.matchedDonation) {
    data.status = 'MATCHED';
    data.matchedAt = new Date().toISOString();

    context.updateMilkBag = true; // Indicate that milk bags should be updated after creation
  } else if (operation === 'update' && !originalDoc?.matchedDonation && data.matchedDonation) {
    data.status = 'MATCHED';
    data.matchedAt = new Date().toISOString();

    context.updateMilkBag = true; // Indicate that milk bags should be updated after update
  }

  context.skipRequestUpdateHook = true; // Prevent further status updates in this operation

  return data;
};
