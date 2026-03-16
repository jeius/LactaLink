import { getMinDistance } from '@/lib/utils/getMinDistance';
import { DONATION_REQUEST_STATUS, URGENCY_LEVELS } from '@lactalink/enums';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractOneImageData } from '@lactalink/utilities/extractors';

/**
 * Sorts a list of donations and requests based on their proximity to the user.
 */
export function sortToNearestListings(items: (Donation | Request)[]) {
  return items.sort((a, b) => {
    const dpA = extractCollection(a.deliveryPreferences);
    const dpB = extractCollection(b.deliveryPreferences);
    const distanceA = getMinDistance(dpA) ?? 0;
    const distanceB = getMinDistance(dpB) ?? 0;
    return distanceA - distanceB;
  });
}

/**
 * Extracts and formats the details of a donation request for display purposes.
 * @param data The donation request data to extract details from.
 * @param isMobile A flag indicating whether the details are being extracted for a mobile view.
 */
export function getRequestDetails(data: Request | undefined, isMobile?: boolean) {
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

/**
 * Extracts and formats the details of a donation for display purposes.
 * @param data The donation data to extract details from.
 * @param isMobile A flag indicating whether the details are being extracted for a mobile view.
 */
export function getDonationDetails(data: Donation | undefined, isMobile?: boolean) {
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
