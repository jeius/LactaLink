import { MILK_BAG_STATUS } from '@lactalink/enums/milkbags';
import { MilkBag } from '@lactalink/types/payload-generated-types';

/**
 * Check if a milk bag has expired based on the current date and its expiresAt field.
 *
 * @returns
 * - `true` if the milk bag has expired and should be marked as EXPIRED
 * - `false` if it hasn't expired
 * - `null` if no status update is needed (e.g., already consumed or discarded).
 */
export async function validateMilkExpiration(doc: Pick<MilkBag, 'expiresAt' | 'status'>) {
  const currentDate = new Date();
  const expiryDate = new Date(doc.expiresAt);

  if (expiryDate < currentDate) {
    // At this point, we know the milk bag has expired
    switch (doc.status) {
      // If already consumed, expired, or discarded, do nothing
      case MILK_BAG_STATUS.CONSUMED.value:
      case MILK_BAG_STATUS.DISCARDED.value:
        return null;

      // For all other statuses, we will proceed to update the status to 'EXPIRED'
      case MILK_BAG_STATUS.DRAFT.value:
      case MILK_BAG_STATUS.AVAILABLE.value:
      case MILK_BAG_STATUS.ALLOCATED.value:
      default:
        return true;
    }
  }

  return false;
}
