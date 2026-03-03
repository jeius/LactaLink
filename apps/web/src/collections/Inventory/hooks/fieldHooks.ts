import { Inventory } from '@lactalink/types/payload-generated-types';
import { FieldHook } from 'payload';

/**
 * Auto-generates a unique human-readable code (e.g. "INV-A3F2E1") for new Inventory records.
 * Used as `useAsTitle` in the admin panel.
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
