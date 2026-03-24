import { MILK_EXPIRY_DAYS } from '@/lib/constants';
import { hookLogger } from '@lactalink/agents/payload';
import { MilkBag } from '@lactalink/types/payload-generated-types';
import { randomBytes } from 'crypto';
import { FieldHook } from 'payload';

/**
 * Generate an expiry date based on the collectedAt date plus a defined number of days.
 * If an expiry date is already provided, it will be returned as is.
 */
export const createExpiryDate: FieldHook<MilkBag, MilkBag['expiresAt']> = ({ data, value }) => {
  if (value && value.trim() !== '') return value;

  // If no expiry date is set, generate one based on the collectedAt date
  const dateCollected = data?.collectedAt ?? new Date().toISOString();
  const expiryDate = new Date(dateCollected);
  expiryDate.setDate(expiryDate.getDate() + MILK_EXPIRY_DAYS);
  return expiryDate.toISOString();
};

/**
 * Generate a unique code for the milk bag if not provided. The code is a
 * random 6-character string. If a code is already provided, it will be returned as is.
 */
export const generateCode: FieldHook<MilkBag, MilkBag['code']> = async ({
  value,
  req,
  collection,
}) => {
  if (value && value.trim() !== '') return value;

  const logger = collection && hookLogger(req, collection.slug, 'generateCode');

  // Function to generate a random 6-character code
  const generateRandomCode = () => randomBytes(3).toString('hex').toUpperCase();

  // Generate an initial code
  let code = generateRandomCode();
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10; // Safety limit to prevent infinite loops

  // Keep trying until we find a unique code
  do {
    // Check if the code exists in the database
    const existingBag = await req.payload.count({
      collection: 'milkBags',
      where: { code: { equals: code } },
      req,
    });

    if (existingBag.totalDocs === 0) {
      // Code is unique
      isUnique = true;
    } else {
      // Generate a new code and try again
      code = generateRandomCode();
      attempts++;
    }
  } while (!isUnique && attempts < maxAttempts);

  if (!isUnique) {
    // Use only clear, unambiguous characters (no 0/O, 1/I, etc.)
    const unambiguousChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let fallbackCode = '';

    // Add a sequential counter for uniqueness
    const counter = (await req.payload.count({ collection: 'milkBags', req })).totalDocs + 1;

    // Use counter for first 2 digits (encoded to base 36)
    fallbackCode += counter.toString(36).padStart(2, '0').toUpperCase();

    // Add 4 unambiguous random characters
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * unambiguousChars.length);
      fallbackCode += unambiguousChars[randomIndex];
    }

    code = fallbackCode.substring(0, 6);

    logger?.warn(
      `Using human-readable fallback code: ${code} after ${maxAttempts} failed attempts`
    );
  }

  logger?.info(`Generated unique milk bag code: ${code}`);
  return code;
};
