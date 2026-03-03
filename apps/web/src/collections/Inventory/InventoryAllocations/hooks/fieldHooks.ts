import { INVENTORY_ALLOCATION_STATUS } from '@lactalink/enums';
import { InventoryAllocation } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { randomUUID } from 'crypto';
import { FieldHook } from 'payload';

/**
 * Set default status to PENDING if not provided
 */
export const defaultStatus: FieldHook<InventoryAllocation, InventoryAllocation['status']> = ({
  value,
}) => {
  if (value) return value; // Status already set
  return INVENTORY_ALLOCATION_STATUS.PENDING.value; // Default to PENDING if not set
};

/**
 * Auto-generate a unique allocationId if not provided
 */
export const defaultAllocationID: FieldHook<
  InventoryAllocation,
  InventoryAllocation['allocationId']
> = ({ value }) => {
  if (value) return value; // allocationID already set

  // Generate a new UUID for the allocationId
  return randomUUID();
};

/**
 * Calculate the initial allocatedVolume based on the selected milk bags when creating a new allocation
 */
export const calculateInitialVolume: FieldHook<
  InventoryAllocation,
  InventoryAllocation['allocatedVolume']
> = async ({ data, value, req }) => {
  if (value) return value; // skip if already set

  // Calculate the total volume of the allocated bags
  const bagIds = extractID(data?.allocatedBags ?? []);

  if (bagIds.length > 0) {
    try {
      const { docs: bags } = await req.payload.find({
        collection: 'milkBags',
        where: { id: { in: bagIds } },
        depth: 0,
        limit: 500,
        pagination: false,
        select: { volume: true },
      });

      return bags.reduce((sum, bag) => sum + (bag.volume ?? 0), 0);
    } catch (error) {
      req.payload.logger.error(
        error,
        `beforeChange InventoryAllocation: could not calculate volume`
      );
    }
  }

  return 0; // Default to 0 if no bags
};

/**
 * Set default allocatedAt to current date if not provided
 */
export const defaultAllocationDate: FieldHook<
  InventoryAllocation,
  InventoryAllocation['allocatedAt']
> = ({ value }) => {
  if (value) return value; // allocationDate already set
  return new Date().toISOString(); // Default to current date if not set
};
