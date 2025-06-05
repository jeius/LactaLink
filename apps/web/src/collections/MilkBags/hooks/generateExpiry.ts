import { MILK_EXPIRY_DAYS } from '@/lib/constants';
import { MilkBag } from '@lactalink/types';
import { CollectionBeforeChangeHook } from 'payload';

export const generateExpiry: CollectionBeforeChangeHook<MilkBag> = async ({ data, operation }) => {
  if (!data.expiresAt && data.collectedAt && operation === 'create') {
    // If no expiry date is set, generate one based on the collectedAt date
    const dateCollected = data.collectedAt;
    const expiryDate = new Date(dateCollected);
    expiryDate.setDate(expiryDate.getDate() + MILK_EXPIRY_DAYS);
    data.expiresAt = expiryDate.toISOString();
  }

  return data;
};
