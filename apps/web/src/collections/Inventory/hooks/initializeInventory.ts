import { InventoryHookContext } from '@/lib/constants/hookContexts';
import { hookLogger, setHookContext } from '@lactalink/agents/payload';
import { Inventory } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionBeforeValidateHook, RequestContext } from 'payload';

export const initializeInventory: CollectionBeforeValidateHook<Inventory> = async ({
  data,
  operation,
  req,
}) => {
  // Only run on create operations
  if (operation !== 'create' || !data?.sourceDonation) {
    return data;
  }

  // Default status to AVAILABLE if not provided
  if (!data.status) {
    data.status = 'AVAILABLE';
  }

  const logger = hookLogger(req, 'inventories', 'beforeValidate');

  try {
    // Get donation information with milk bags
    const sourceDonation = await req.payload.findByID({
      collection: 'donations',
      id: extractID(data.sourceDonation),
      depth: 0,
      select: { details: { bags: true } },
    });

    // Get milk bag IDs from the donation
    const milkBagIDs = extractID(sourceDonation.details.bags);

    // Store milk bag IDs in the request context for use in afterChange hook
    setHookContext<RequestContext['milkbags']>(
      req,
      InventoryHookContext.MilkBagIDs,
      sourceDonation.details.bags
    );

    if (milkBagIDs.length > 0) {
      const { docs: bags } = await req.payload.find({
        collection: 'milkBags',
        where: {
          id: { in: milkBagIDs },
          status: { equals: 'AVAILABLE' },
        },
        select: { volume: true, expiresAt: true },
        depth: 0,
        req,
      });

      // If initialVolume or remainingVolume is not provided, calculate total volume from bags
      if (!data.initialVolume || !data.remainingVolume) {
        // Calculate total volume
        const totalVolume = bags.reduce((sum, bag) => sum + (bag.volume || 0), 0);

        // Set initial and remaining volumes to the total volume of the bags
        data.initialVolume = data.initialVolume || totalVolume;
        data.remainingVolume = data.remainingVolume || totalVolume;

        logger.info(
          `Initialized inventory with ${milkBagIDs.length} milk bags totaling ${totalVolume}ml`
        );
      }

      // Compute the earliest expiry across all available bags
      const earliestExpiry = bags.reduce<Date | null>((min, bag) => {
        if (!bag.expiresAt) return min;
        const expirationDate = new Date(bag.expiresAt);
        return min === null || expirationDate < min ? expirationDate : min;
      }, null);

      // If we found an expiry date, set it on the inventory
      if (earliestExpiry) {
        data.expiresAt = earliestExpiry.toISOString();
      }
    }

    return data;
  } catch (error) {
    logger.error(error, `Error initializing inventory`);
    return data;
  }
};
