import { DONATION_REQUEST_STATUS, URGENCY_LEVELS } from '@lactalink/enums';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractOneImageData } from '@lactalink/utilities/extractors';

export function getRequestDetails(data: Request | undefined, isMobile: boolean) {
  const volume = data?.initialVolumeNeeded || 0;
  const fulfilledVolume = data?.volumeFulfilled || 0;
  const percentage = Math.round((fulfilledVolume / volume) * 100);

  const requester = extractCollection(data?.requester);

  const status = data?.status || DONATION_REQUEST_STATUS.PENDING.value;
  const notes = data?.details?.notes || '';
  const reason = data?.details?.reason || '';
  const urgency = data?.details?.urgency || URGENCY_LEVELS.LOW.value;
  const requestImg = extractCollection(data?.details?.image);
  const image = extractOneImageData(requestImg, isMobile ? 'sm' : 'lg');
  const bags = extractCollection(data?.details?.bags);
  return {
    volume,
    status,
    image,
    requester,
    urgency,
    percentage,
    fulfilledVolume,
    reason,
    notes,
    bags,
  };
}

export function getDonationDetails(data: Donation | undefined, isMobile: boolean) {
  const volume = data?.volume || 0;
  const remainingVolume = data?.remainingVolume || 0;
  const percentage = Math.round((remainingVolume / volume) * 100);
  const donor = extractCollection(data?.donor);
  const status = data?.status || DONATION_REQUEST_STATUS.PENDING.value;
  const notes = data?.details?.notes || '';
  const milkSample = extractCollection(data?.details?.milkSample);
  const image = extractOneImageData(milkSample, isMobile ? 'sm' : 'lg');
  const bags = extractCollection(data?.details?.bags);
  return { volume, image, donor, status, percentage, remainingVolume, notes, bags };
}
