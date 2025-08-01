import { DeliveryPreference } from '@lactalink/types';
import { extractCollection } from '../extractors/extractCollection';
import { getDistance } from '../geo-utils';

export function matchDeliveryPreferences(
  donationDP: DeliveryPreference,
  requestDP: DeliveryPreference,
  maxDistance?: number
): boolean {
  // Check if two delivery preferences match
  const { preferredMode: donationMode, availableDays } = donationDP;
  const { preferredMode: requestMode, availableDays: requestDays } = requestDP;

  const donationAdd = extractCollection(donationDP.address);
  const requestAdd = extractCollection(requestDP.address);

  const matches: boolean[] = [];

  if (donationAdd?.coordinates && requestAdd?.coordinates && maxDistance) {
    const distance = getDistance(donationAdd.coordinates, requestAdd.coordinates);
    matches.push(distance <= maxDistance);
  }

  matches.push(requestMode.some((mode) => donationMode.includes(mode)));
  matches.push(availableDays.some((day) => requestDays.includes(day)));

  return matches.every(Boolean);
}
