/**
 * @fileoverview Helper functions for the Inventory collection's hooks and configs.
 */

import { InventoryHookContext } from '@/lib/constants/hookContexts';
import { getHookContext, hookLogger } from '@lactalink/agents/payload';
import { Inventory } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { PayloadRequest, RequestContext, ValidationError } from 'payload';

/**
 * Queries the milk bags associated with the inventory entry using the provided milk bag IDs.
 *
 * @param milkbagIDs - An array of milk bag IDs to query.
 * @param req - The Payload request object, used to perform the query operation on the milk bags collection.
 * @returns A promise that resolves to an array of `MilkBag` documents matching the provided IDs.
 * @throws A `ValidationError` if no milk bag IDs are provided or `Error` if the query operation fails.
 */
export async function getMilkBags(milkbagIDs: string[], req: PayloadRequest) {
  if (milkbagIDs.length === 0) {
    throw new ValidationError({
      collection: 'inventories',
      req,
      errors: [
        {
          path: 'inputBags',
          label: 'Input Bags',
          message: 'At least one milk bag must be linked to the inventory entry on create.',
        },
      ],
    });
  }

  const { docs: bags } = await req.payload.find({
    collection: 'milkBags',
    where: { id: { in: milkbagIDs } },
    req,
    limit: 0, // Retrieve all matching bags
    depth: 0, // Avoid populating relationships for performance
  });

  return bags;
}

/**
 * Links milk bags to the inventory entry by updating the `inventory` field of each milk bag.
 *
 * @param doc - The inventory document that was created or updated.
 * @param req - The Payload request object, used to perform updates on the milk bags.
 * @returns A message indicating the result of the linking operation,
 * or null if no milk bags were linked.
 */
export async function linkMilkBagsToInventory(
  doc: Inventory,
  req: PayloadRequest,
  logger?: ReturnType<typeof hookLogger>
) {
  logger?.info(`Preparing to link milk bags to inventory ${doc.id}...`);

  const milkBags = getHookContext<RequestContext['milkbags']>(req, InventoryHookContext.MilkBags);

  const milkBagIDs = extractID(milkBags);

  if (!milkBagIDs || milkBagIDs.length === 0) {
    logger?.info('No milk bags to link to inventory.');
    return;
  }

  await req.payload.update({
    collection: 'milkBags',
    where: { id: { in: milkBagIDs } },
    data: { inventory: doc.id },
    depth: 0,
    limit: 0, // Update all matching allocations
    req,
  });

  logger?.info(`Linked ${milkBagIDs.length} milk bags to inventory ${doc.id}`);
}
