import { MILK_EXPIRY_DAYS } from '@/lib/constants';
import { MilkBag } from '@lactalink/types';
import { randomBytes } from 'crypto';
import { CollectionBeforeChangeHook } from 'payload';

export const generateCode: CollectionBeforeChangeHook<MilkBag> = async ({ data, operation }) => {
  if (operation === 'create' && !data.code) {
    // Generate a unique 6-character code
    data.code = randomBytes(3).toString('hex').toUpperCase();
  }

  return data;
};

export const generateTitle: CollectionBeforeChangeHook<MilkBag> = async ({ data }) => {
  if (!data.code || !data.volume) return data;

  data.title = `${data.code} - ${data.volume} mL`;

  return data;
};

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
