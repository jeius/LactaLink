import { Request } from '@lactalink/types/payload-generated-types';
import { FieldHook } from 'payload';

/**
 * Field hook to calculate the fulfillment percentage for a Request based on the
 * fulfilled and needed volumes.
 */
export const caculateFulfillmentPercentage: FieldHook<
  Request,
  Request['fulfillmentPercentage']
> = ({ data }) => {
  const volumeNeeded = data?.initialVolumeNeeded || 20;
  const volumeFulfilled = data?.volumeFulfilled || 0;
  const percentage = Math.min(100, Math.round((volumeFulfilled / volumeNeeded) * 100));
  return percentage;
};
