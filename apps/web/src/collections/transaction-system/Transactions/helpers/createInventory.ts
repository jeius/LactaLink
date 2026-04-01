import { InventoryHookContext } from '@/lib/constants/hookContexts';
import { getEarliestExpiryDateOfBags } from '@/lib/utils/collections/getEarliestExpiryDateOfBags';
import { hookLogger, setHookContext } from '@lactalink/agents/payload';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { PayloadRequest, RequestContext } from 'payload';

/**
 * Creates a new inventory entry for the following cases:
 * - When the transaction is a donation to an organization (P2O).
 * - When the transaction is a transfer of milk bags between organizations (O2O).
 *
 * @remarks
 * In both cases, the inventory entry is created based on the milk bags included in the transaction,
 * and linked to the source donation if applicable.
 *
 * The inventory's status is set to `AVAILABLE` by default.
 *
 * @param transaction - The transaction for which to create the inventory entry.
 * @param req - The Payload request to handle operations.
 * @param logger - Optional logger for structured logging within the function.
 */
export async function createInventory(
  transaction: Transaction,
  req: PayloadRequest,
  logger?: ReturnType<typeof hookLogger>
) {
  const { recipient, type } = transaction;

  if (type === 'P2P' || type === 'O2P') {
    logger?.info('Skipping inventory creation for P2P or O2P transaction...');
    return;
  }

  const donationID = extractID(transaction.donation);

  const recipientSlug = recipient.relationTo;
  const recipientId = extractID(recipient.value);

  if (recipientSlug === 'individuals') {
    logger?.info('Recipient is an individual, skipping inventory creation...');
    return;
  }

  const milkBagIDs = extractID(transaction.milkBags);
  if (milkBagIDs.length === 0) {
    logger?.info('No milk bags provided, skipping inventory creation.');
    return null;
  }

  try {
    const { docs: milkbags } = await req.payload.find({
      collection: 'milkBags',
      where: { id: { in: milkBagIDs } },
      req,
      depth: 0,
      limit: 0,
    });

    // Milkbags should only be linked to one inventory entry, therefore we must check
    // if any of the bags are already linked to an inventory entry under the same donation
    const alreadyLinkedBags = await req.payload.count({
      req,
      collection: 'milkBags',
      where: {
        and: [
          { id: { in: milkBagIDs } },
          { inventory: { exists: true } },
          { 'inventory.sourceDonation': { equals: donationID } },
        ],
      },
    });

    if (alreadyLinkedBags.totalDocs > 0) {
      logger?.info(`Some milk bags are already linked to an inventory entry.`);
      logger?.info('Using the existing inventory entry instead...');

      const { docs: existingInventories } = await req.payload.find({
        collection: 'inventories',
        where: {
          and: [
            { sourceDonation: { equals: donationID } },
            { 'organization.value': { equals: recipientId } },
            { 'organization.relationTo': { equals: recipientSlug } },
          ],
        },
        req,
        depth: 0,
      });
    }

    const earliestExpiry = getEarliestExpiryDateOfBags(milkbags)?.toISOString();
    const totalVolume = milkbags.reduce((total, bag) => total + (bag.volume || 0), 0);

    // Store milk bags in the request context to minimize redundant queries in
    // the Inventory creation hooks
    setHookContext<RequestContext['milkbags']>(req, InventoryHookContext.MilkBags, milkbags);

    const inventory = await req.payload.create({
      collection: 'inventories',
      req,
      data: {
        inputBags: extractID(milkbags),
        initialVolume: totalVolume,
        remainingVolume: totalVolume,
        expiresAt: earliestExpiry,
        organization: { relationTo: recipientSlug, value: recipientId },
        sourceDonation: donationID,
        status: 'AVAILABLE',
        code: undefined as unknown as string, // Let the backend auto-generate the code
      },
    });

    logger?.info(`Created inventory with ${milkbags.length} milk bags totaling ${totalVolume}ml`, {
      inventoryID: inventory.id,
      bagIDs: extractID(milkbags),
      totalVolume,
      expiresAt: earliestExpiry,
    });

    return inventory;
  } catch (error) {
    logger?.error(error, `Failed to create inventory: ${extractErrorMessage(error)}`);
    throw error;
  }
}
