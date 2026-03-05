import { Inventory } from '@lactalink/types/payload-generated-types';
import { FieldHook } from 'payload';

/**
 * Inventory `FieldHook` to auto-generate a unique human-readable code for new Inventory records.
 *
 * @description
 * This hook executes the following logic:
 * - Generates a code in the format `INV-XXXXXX`, where `XXXXXX` is a random 6-character hexadecimal string.
 * - It checks for uniqueness against existing inventory codes to prevent collisions.
 * - If a code is provided (e.g., during an update), it will not overwrite it.
 */
export const generateInventoryCode: FieldHook<Inventory, Inventory['code']> = async ({
  req,
  value,
}) => {
  // If code is already provided, skip generation
  if (value && value !== '') return value;

  let code: string;
  let attempts = 0;

  // Retry until a unique code is found (collision probability is negligible but handled)
  do {
    const randomHex = Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .toUpperCase()
      .padStart(6, '0');
    code = `INV-${randomHex}`;

    const existing = await req.payload.count({
      collection: 'inventories',
      where: { code: { equals: code } },
    });

    if (existing.totalDocs === 0) break;
    attempts++;
  } while (attempts < 5);

  return code;
};
