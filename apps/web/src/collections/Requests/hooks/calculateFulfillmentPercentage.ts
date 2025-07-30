import { Request } from '@lactalink/types';
import { CollectionBeforeReadHook } from 'payload';

export const calculateFulfillmentPercentage: CollectionBeforeReadHook<Request> = async ({
  doc,
}) => {
  const volumeNeeded = doc.volumeNeeded || 0;
  const volumeFulfilled = doc.volumeFulfilled || 0;

  if (volumeNeeded > 0) {
    // Calculate fulfillment percentage
    const fulfillmentPercentage = Math.min(100, Math.round((volumeFulfilled / volumeNeeded) * 100));

    // Add fulfillmentPercentage as a virtual field
    return {
      ...doc,
      fulfillmentPercentage,
      remainingNeeded: Math.max(0, volumeNeeded - volumeFulfilled),
    };
  }

  return doc;
};
