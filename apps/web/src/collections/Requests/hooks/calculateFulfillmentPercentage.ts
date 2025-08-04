import { Request } from '@lactalink/types';
import { CollectionBeforeReadHook } from 'payload';

export const calculateFulfillmentPercentage: CollectionBeforeReadHook<Request> = async ({
  doc,
}) => {
  const volumeNeeded = doc.volumeNeeded;
  const volumeFulfilled = doc.volumeFulfilled || 0;

  if (volumeNeeded > 0) {
    // Calculate fulfillment percentage
    const percentage = Math.min(100, Math.round((volumeFulfilled / volumeNeeded) * 100));

    doc.fulfillmentPercentage = percentage;
  }

  return doc;
};
