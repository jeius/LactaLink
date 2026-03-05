import { MilkBag } from '@lactalink/types/payload-generated-types';

/**
 * Utility function to get the earliest expiry date from an array of milk bags.
 *
 * @param bags - An array of `MilkBag` objects to evaluate.
 * @returns The earliest expiry date found among the milk bags, or null if no valid expiry dates are present.
 */
export function getEarliestExpiryDateOfBags(bags: MilkBag[]): Date | null {
  if (bags.length === 0) return null;

  return bags.reduce<Date | null>((min, bag) => {
    if (!bag.expiresAt) return min;
    const expirationDate = new Date(bag.expiresAt);
    return min === null || expirationDate < min ? expirationDate : min;
  }, null);
}
