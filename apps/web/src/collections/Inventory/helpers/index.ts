/**
 * @fileoverview Helper functions for the Inventory collection's hooks and configs.
 */

import { InventoryHookContext } from '@/lib/constants/hookContexts';
import { getHookContext, hookLogger } from '@lactalink/agents/payload';
import { Donation, Inventory, MilkBag } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { PayloadRequest, RequestContext } from 'payload';

/**
 * Retrieves milk bags associated with a source donation.
 *
 * @param donation - The source donation, which can be either a string ID or a `Donation` object.
 * @param req - The `PayloadRequest` that handles the operations.
 * @param logger - Optional logger for logging information and errors during the retrieval process.
 * @returns An array of `MilkBag` objects associated with the source donation. `null` if no bags found.
 */
export async function getMilkBagsFromSourceDonation(
  donation: string | Donation,
  req: PayloadRequest,
  logger?: ReturnType<typeof hookLogger>
): Promise<MilkBag[] | null> {
  const donationDoc =
    extractCollection(donation) ??
    (await req.payload.findByID({
      collection: 'donations',
      id: extractID(donation),
      depth: 0,
      select: { details: { bags: true } },
    }));

  const bagIDs = extractID(donationDoc.details?.bags || []);

  if (bagIDs.length === 0) {
    logger?.info(`No milk bags found for donation ${extractID(donation)}`);
    return null;
  }

  const { docs: bags } = await req.payload.find({
    collection: 'milkBags',
    where: { id: { in: bagIDs } },
    req,
    depth: 0,
    limit: 0, // Get all matching bags
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
