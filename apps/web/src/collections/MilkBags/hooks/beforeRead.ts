import { MilkBagHookContext } from '@/lib/constants/hookContexts';
import { isHookRun, markHookRun } from '@lactalink/agents/payload';
import { MILK_BAG_STATUS } from '@lactalink/enums';
import { MilkBag } from '@lactalink/types/payload-generated-types';
import { CollectionBeforeReadHook } from 'payload';
import { validateMilkExpiration } from '../helpers/validateMilkExpiration';

/**
 * Before reading a milk bag, check if it has expired based on the current date and its expiresAt field.
 * If it has expired and isn't already marked as EXPIRED, update its status to EXPIRED.
 * This ensures that any read operation on an expired milk bag will reflect its expired status,
 * even if the status wasn't updated at the exact moment of expiry.
 */
export const beforeRead: CollectionBeforeReadHook<MilkBag> = async ({ doc, req }) => {
  if (doc.status === MILK_BAG_STATUS.EXPIRED.value) return doc;

  // Prevent infinite loops
  if (isHookRun(req, MilkBagHookContext.SkipExpiryCheck)) return doc;
  markHookRun(req, MilkBagHookContext.SkipExpiryCheck);

  if (!doc.expiresAt) return doc; // If there's no expiry date, we can't check for expiry

  const isExpired = await validateMilkExpiration(doc);

  if (!isExpired) return doc; // If the milk bag hasn't expired, return as is

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

  return doc;
};
