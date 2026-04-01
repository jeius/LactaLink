import { getMinDistance } from '@/lib/utils/getMinDistance';
import { DONATION_REQUEST_STATUS, URGENCY_LEVELS } from '@lactalink/enums';
import { Donation, Request, User } from '@lactalink/types/payload-generated-types';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import { extractCollection, extractID, extractOneImageData } from '@lactalink/utilities/extractors';
import { isDonation } from '@lactalink/utilities/type-guards';

const STATUS = DONATION_REQUEST_STATUS;

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
 * @param doc The donation request data to extract details from.
 * @param isMobile A flag indicating whether the details are being extracted for a mobile view.
 */
export function getRequestDetails(doc: Request | undefined, isMobile?: boolean) {
  const volume = doc?.initialVolumeNeeded || 0;
  const fulfilledVolume = doc?.volumeFulfilled || 0;
  const percentage = Math.round((fulfilledVolume / volume) * 100);

  const requester = extractCollection(doc?.requester);

  const status = doc?.status || STATUS.PENDING.value;
  const notes = doc?.details?.notes || '';
  const reason = doc?.details?.reason || '';
  const urgency = doc?.details?.urgency || URGENCY_LEVELS.LOW.value;
  const requestImg = extractCollection(doc?.details?.image);
  const image = extractOneImageData(requestImg, isMobile ? 'sm' : 'lg');
  const bags = extractCollection(doc?.details?.bags);
  return {
    volume,
    status: STATUS[status],
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
 * @param doc The donation data to extract details from.
 * @param isMobile A flag indicating whether the details are being extracted for a mobile view.
 */
export function getDonationDetails(doc: Donation | undefined, isMobile?: boolean) {
  const volume = doc?.volume || 0;
  const remainingVolume = doc?.remainingVolume || 0;
  const percentage = Math.round((remainingVolume / volume) * 100);
  const donor = extractCollection(doc?.donor);
  const status = doc?.status || STATUS.PENDING.value;
  const notes = doc?.details?.notes || '';
  const milkSample = extractCollection(doc?.details?.milkSample);
  const image = extractOneImageData(milkSample, isMobile ? 'sm' : 'lg');
  const bags = extractCollection(doc?.details?.bags);
  return {
    volume,
    image,
    donor,
    status: STATUS[status],
    percentage,
    remainingVolume,
    notes,
    bags,
  };
}

/**
 * Determines whether a given donation or request document is editable by the current user.
 * @param doc The donation or request document to check for editability.
 * @param user The current user whose permissions are being checked.
 * @returns A boolean indicating whether the document is editable by the user.
 */
export function isEditableListing(doc: Donation | Request, user: User | null): boolean {
  if (!user?.profile) return false;

  const editableStatuses: Donation['status'][] = [STATUS.PENDING.value, STATUS.AVAILABLE.value];

  return isOwner(doc, user) && editableStatuses.includes(doc.status);
}

/**
 * Determines whether a given donation or request document is cancellable by the current user.
 * @param doc The donation or request document to check for cancellability.
 * @param user The current user whose permissions are being checked.
 * @returns A boolean indicating whether the document is cancellable by the user.
 */
export function isCancellableListing(doc: Donation | Request, user: User | null): boolean {
  if (!user?.profile) return false;

  const cancellableStatuses: Donation['status'][] = [STATUS.PENDING.value, STATUS.AVAILABLE.value];

  return isOwner(doc, user) && cancellableStatuses.includes(doc.status);
}

/**
 * Determines whether a given donation or request document is deletable by the current user.
 * @param doc The donation or request document to check for deletability.
 * @param user The current user whose permissions are being checked.
 * @returns A boolean indicating whether the document is deletable by the user.
 */
export function isDeletableListing(doc: Donation | Request, user: User | null): boolean {
  if (!user?.profile) return false;
  return isOwner(doc, user) && doc.status !== STATUS.MATCHED.value;
}

/**
 * Determines whether a given donation or request document is approvable or rejectable by the current user.
 * @param doc The donation or request document to check.
 * @param user The current user whose permissions are being checked.
 * @returns A boolean indicating whether the document is resolvable by the user.
 */
export function isResolvableListing(doc: Donation | Request, user: User | null): boolean {
  if (!user?.profile || !doc.recipient) return false;

  return isRecipient(doc.recipient, user) && doc.status === STATUS.PENDING.value;
}

/**
 * Determines whether a given donation or request document is still available for matching.
 *
 * For donations, this means it has available milk bags. For requests, this means it has unfulfilled volume.
 * @param doc The donation or request document to check for availability.
 * @returns A boolean indicating whether the document is available for matching.
 */
export function isAvailableListing(doc: Donation | Request): boolean {
  if (doc.status === STATUS.AVAILABLE.value) return true;

  // We consider a listing available if it still has unallocated milk bags for donations, or
  // if it has unfulfilled volume for requests.
  if (doc.status !== STATUS.PENDING.value) return false;

  if (isDonation(doc)) {
    const bags = extractCollection(doc.details?.bags);
    const availableBags = bags.filter((bag) => bag.status === 'AVAILABLE');
    return availableBags.length > 0;
  }

  const volume = doc.initialVolumeNeeded || 0;
  const fulfilledVolume = doc.volumeFulfilled || 0;
  return fulfilledVolume < volume;
}

// #region Helpers -----------------------------------------------
function isOwner(doc: Donation | Request, user: User) {
  const actorID = isDonation(doc) ? extractID(doc.donor) : extractID(doc.requester);
  return isEqualProfiles(user.profile, { relationTo: 'individuals', value: actorID });
}

function isRecipient(recipient: NonNullable<Donation['recipient']>, user: User) {
  return isEqualProfiles(user.profile, recipient);
}
// #endregion
