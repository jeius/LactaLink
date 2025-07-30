import { Inventory } from '@lactalink/types';
import { extractErrorMessage, extractID } from '@lactalink/utilities';
import { CollectionBeforeValidateHook } from 'payload';

export const initializeInventory: CollectionBeforeValidateHook<Inventory> = async ({
  data,
  operation,
  req,
}) => {
  // Only run on create operations
  if (operation !== 'create' || !data?.sourceDonation) {
    return data;
  }

  try {
    // Get donation information with milk bags
    const sourceDonation = await req.payload.findByID({
      collection: 'donations',
      id: extractID(data.sourceDonation),
      depth: 0,
    });

    // Get milk bags from the donation
    const milkBags = sourceDonation.details.bags || [];

    // Get volumes of all bags
    let totalVolume = 0;
    if (milkBags.length > 0) {
      const milkBagIds = extractID(milkBags);

      const { docs: bags } = await req.payload.find({
        collection: 'milkBags',
        where: {
          id: { in: milkBagIds },
          status: { equals: 'AVAILABLE' },
        },
        depth: 0,
      });

      // Calculate total volume
      bags.forEach((bag) => {
        totalVolume += bag.volume || 0;
      });

      // Set the milk bags for the inventory
      data.milkBags = milkBagIds;
    }

    // Set the initial and remaining volumes
    data.initialVolume = totalVolume;
    data.remainingVolume = totalVolume;
    data.status = 'AVAILABLE';

    req.payload.logger.info(
      `Initialized inventory with ${milkBags.length} milk bags totaling ${totalVolume}ml`
    );

    return data;
  } catch (error) {
    req.payload.logger.error(`Error initializing inventory: ${extractErrorMessage(error)}`);
    return data;
  }
};
