import { MilkBag } from '@lactalink/types';
import { extractErrorMessage } from '@lactalink/utilities';
import { Payload } from 'payload';

type AllocationItem = {
  inventoryId: string;
  bags: MilkBag[];
};

/**
 * Allocates inventory items to fulfill a request
 * Handles cases where multiple inventory items are needed for a single request
 */
export const allocateInventory = async ({
  payload,
  requestId,
  allocations,
  notes = '',
}: {
  payload: Payload;
  requestId: string;
  allocations: AllocationItem[];
  notes?: string;
}): Promise<boolean> => {
  try {
    // Validate request exists
    const request = await payload.findByID({
      collection: 'requests',
      id: requestId,
      depth: 0,
    });

    if (!request) {
      throw new Error(`Request ${requestId} not found`);
    }

    // Calculate total allocation volume
    const totalVolume = allocations.reduce(
      (sum, item) => sum + item.bags.reduce((bagSum, bag) => bagSum + bag.volume, 0),
      0
    );

    // Check if allocation exceeds what's needed
    const remainingNeeded = (request.volumeNeeded || 0) - (request.volumeFulfilled || 0);
    if (totalVolume > remainingNeeded) {
      throw new Error(
        `Allocation volume (${totalVolume}) exceeds remaining needed volume (${remainingNeeded})`
      );
    }

    // Generate a shared allocation ID for grouping
    const sharedAllocationId = crypto.randomUUID();

    // Update each inventory item
    for (const allocation of allocations) {
      const inventory = await payload.findByID({
        collection: 'inventory',
        id: allocation.inventoryId,
      });

      // Make sure inventory has enough volume
      if ((inventory.remainingVolume || 0) < allocation.volume) {
        throw new Error(`Inventory ${allocation.inventoryId} has insufficient volume`);
      }

      // Add allocation to this inventory
      const existingAllocations = inventory.allocationDetails || [];

      await payload.update({
        collection: 'inventory',
        id: allocation.inventoryId,
        data: {
          allocationDetails: [
            ...existingAllocations,
            {
              request: requestId,
              allocatedVolume: allocation.volume,
              allocationId: sharedAllocationId,
              allocatedAt: new Date().toISOString(),
              notes,
            },
          ],
        },
      });
    }

    payload.logger.info({
      message: `Allocated ${totalVolume}ml to request ${requestId} from ${allocations.length} inventory items`,
      allocationId: sharedAllocationId,
    });

    return true;
  } catch (error) {
    payload.logger.error(`Failed to allocate inventory: ${extractErrorMessage(error)}`);
    return false;
  }
};
