import { MILK_EXPIRY_DAYS } from '@/lib/constants';
import { MilkBag } from '@lactalink/types/payload-generated-types';
import { randomBytes } from 'crypto';
import { CollectionBeforeChangeHook, FieldHook } from 'payload';

export const generateExpiry: FieldHook<MilkBag> = ({ data, value }) => {
  if (value && value !== '') return value; // Expiry date already set

  // If no expiry date is set, generate one based on the collectedAt date
  const dateCollected = data?.collectedAt ?? new Date().toISOString();
  const expiryDate = new Date(dateCollected);
  expiryDate.setDate(expiryDate.getDate() + MILK_EXPIRY_DAYS);
  return expiryDate.toISOString();
};

export const generateCode: CollectionBeforeChangeHook<MilkBag> = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create') return data;

  // Function to generate a random 6-character code
  const generateRandomCode = () => randomBytes(3).toString('hex').toUpperCase();

  // Generate an initial code
  let code = generateRandomCode();
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10; // Safety limit to prevent infinite loops

  // Keep trying until we find a unique code
  while (!isUnique && attempts < maxAttempts) {
    // Check if the code exists in the database
    const existingBag = await req.payload.find({
      collection: 'milkBags',
      where: { code: { equals: code } },
      limit: 1,
      pagination: false,
    });

    if (existingBag.docs.length === 0) {
      // Code is unique
      isUnique = true;
    } else {
      // Generate a new code and try again
      code = generateRandomCode();
      attempts++;
    }
  }

  if (!isUnique) {
    // Create a more human-readable fallback code
    // Use only clear, unambiguous characters (no 0/O, 1/I, etc.)
    const unambiguousChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let fallbackCode = '';

    // Add a sequential counter for uniqueness
    const counter =
      (
        await req.payload.find({
          collection: 'milkBags',
          limit: 1,
          pagination: false,
          sort: '-createdAt',
        })
      ).totalDocs + 1;

    // Use counter for first 2 digits (encoded to base 36)
    fallbackCode += counter.toString(36).padStart(2, '0').toUpperCase();

    // Add 4 unambiguous random characters
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * unambiguousChars.length);
      fallbackCode += unambiguousChars[randomIndex];
    }

    code = fallbackCode.substring(0, 6);
    req.payload.logger.warn(
      `Using human-readable fallback code: ${code} after ${maxAttempts} failed attempts`
    );
  }

  // Assign the unique code
  data.code = code;
  req.payload.logger.info(`Generated unique milk bag code: ${code}`);

  // Also assign title
  data.title = `${code} - ${data.volume ?? 0} mL`;

  return data;
};
