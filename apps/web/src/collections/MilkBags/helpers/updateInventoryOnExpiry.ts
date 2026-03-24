import { MILK_BAG_STATUS } from '@lactalink/enums/milkbags';
import { MilkBag } from '@lactalink/types/payload-generated-types';
import { extractErrorMessage, extractID } from '@lactalink/utilities/extractors';
import { PayloadRequest } from 'payload';

/**
 * When a milk bag transitions to EXPIRED, cascade the change to any Inventory records
 * that contain this bag:
 *  - Subtract the bag's volume from `remainingVolume`
 *  - If no bags with AVAILABLE status remain, set Inventory `status` to EXPIRED
 */
export async function updateInventoryOnExpiry(
  doc: MilkBag,
  previousDoc: MilkBag | null,
  req: PayloadRequest
) {
  const expiredStatus = MILK_BAG_STATUS.EXPIRED.value;

  // Only react when a bag newly transitions to EXPIRED
  if (doc.status !== expiredStatus) return;
  if (previousDoc?.status === expiredStatus) return;

  // If the bag isn't linked to any inventory, no need to proceed
  if (!doc.inventory) return;

  try {
    const inventoryID = extractID(doc.inventory);

    const [inventory, { docs: bags }] = await Promise.all([
      // Fetch the inventory to get its current remainingVolume and status
      req.payload.findByID({
        collection: 'inventories',
        id: inventoryID,
        depth: 0,
        select: { status: true },
      }),
      // Fetch live statuses of remaining bags
      req.payload.find({
        collection: 'milkBags',
        where: { inventory: { equals: inventoryID } },
        select: { volume: true, status: true },
        depth: 0,
        limit: 1000,
        pagination: false,
      }),
    ]);

    // Recalculate remaining volume from bags that are still AVAILABLE
    const remainingVolume = bags.reduce((sum, bag) => {
      if (bag.status === 'AVAILABLE') return sum + (bag.volume ?? 0);
      return sum;
    }, 0);

    const hasAvailableBags = bags.some((b) => b.status === 'AVAILABLE');
    const newStatus = hasAvailableBags ? inventory.status : 'EXPIRED';

    await req.payload.update({
      collection: 'inventories',
      id: inventoryID,
      data: {
        remainingVolume,
        status: newStatus,
      },
    });

    req.payload.logger.info(
      `Inventory ${inventoryID}: bag ${doc.id} expired — remainingVolume → ${remainingVolume}ml, status → ${newStatus}`
    );

    // // Create an inventory event for this expiry
    // await req.payload.create({
    //   req,
    //   collection: 'milk-bag-events',
    //   data: {
    //     milkBag: extractID(doc),
    //     fromParty: { ...previousDoc.owner, value: extractID(previousDoc.owner.value) },
    //     toParty: { ...doc.owner, value: extractID(doc.owner.value) },
    //     reason: 'Ownership Transfer',
    //     occurredAt: new Date().toISOString(),
    //     eventType: 'ALLOCATED',
    //     fromStatus: previousDoc.status,
    //     toStatus: doc.status,
    //     isSystemGenerated: true,
    //     source: 'SYSTEM',
    //     sequenceNumber: 0, // Will be set correctly in the beforeChange hook
    //   },
    // });
  } catch (error) {
    req.payload.logger.error(
      `updateInventoryOnExpiry: failed for bag ${doc.id}: ${extractErrorMessage(error)}`
    );
  }
}
