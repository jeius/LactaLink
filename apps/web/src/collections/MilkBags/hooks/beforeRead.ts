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
  return await validateMilkExpiration(doc, req);
};
