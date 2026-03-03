import { MilkBagHookContext } from '@/lib/constants/hookContexts';
import { isHookRun, markHookRun } from '@lactalink/agents/payload';
import { MILK_BAG_STATUS } from '@lactalink/enums/milkbags';
import { MilkBag } from '@lactalink/types/payload-generated-types';
import { PayloadRequest } from 'payload';

/**
 * Before reading a milk bag, check if it has expired based on the current date and its expiresAt field.
 * If it has expired and isn't already marked as EXPIRED, update its status to EXPIRED.
 * This ensures that any read operation on an expired milk bag will reflect its expired status,
 * even if the status wasn't updated at the exact moment of expiry.
 */
export async function validateMilkExpiration(doc: MilkBag, req: PayloadRequest) {
  // This hook runs before every read operation on a milk bag, so we need to be mindful of performance.
  // We will only perform the expiry check if the bag isn't already marked as EXPIRED to minimize unnecessary updates.
  if (doc.status === MILK_BAG_STATUS.EXPIRED.value) return doc;

  // To prevent potential infinite loops where updating the status triggers another read, we need to check
  // if we've already performed the expiry check for this request.
  if (isHookRun(req, MilkBagHookContext.SkipExpiryCheck)) return doc;

  // Mark that we've performed the expiry check for this request to avoid redundant checks/updates
  markHookRun(req, MilkBagHookContext.SkipExpiryCheck);

  if (!doc.expiresAt) return doc; // If there's no expiry date, we can't check for expiry

  const currentDate = new Date();
  const expiryDate = new Date(doc.expiresAt);

  if (expiryDate < currentDate) {
    // At this point, we know the milk bag has expired
    switch (doc.status) {
      // If already consumed, expired, or discarded, do nothing
      case MILK_BAG_STATUS.CONSUMED.value:
      case MILK_BAG_STATUS.DISCARDED.value:
        return doc;

      // For all other statuses, we will proceed to update the status to 'EXPIRED'
      case MILK_BAG_STATUS.DRAFT.value:
      case MILK_BAG_STATUS.AVAILABLE.value:
      case MILK_BAG_STATUS.ALLOCATED.value:
      default:
        break;
    }

    // Update the milk bag's status to EXPIRED
    const updated = await req.payload.update({
      collection: 'milkBags',
      id: doc.id,
      data: { status: MILK_BAG_STATUS.EXPIRED.value },
      depth: 0,
      req,
    });

    // Update the status in the returned doc to reflect the change
    doc.status = updated.status;
  }

  return doc;
}
