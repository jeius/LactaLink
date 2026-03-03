import { INVENTORY_ALLOCATION_STATUS, MILK_BAG_STATUS } from '@lactalink/enums';
import { Inventory, Request } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { PayloadRequest } from 'payload';

const pendingStatus = INVENTORY_ALLOCATION_STATUS.PENDING.value;
const allocatedBagStatus = MILK_BAG_STATUS.ALLOCATED.value;
const availableBagStatus = MILK_BAG_STATUS.AVAILABLE.value;

export async function markBagsAsAllocated(bagIds: string[], req: PayloadRequest) {
  if (!bagIds.length) return;
  await req.payload.update({
    collection: 'milkBags',
    where: { id: { in: bagIds } },
    data: { status: allocatedBagStatus },
    depth: 0,
    req,
  });
  return `Marked ${bagIds.length} bag(s) as ALLOCATED`;
}

export async function restoreBagsToAvailable(bagIds: string[], req: PayloadRequest) {
  if (!bagIds.length) return;
  await req.payload.update({
    collection: 'milkBags',
    where: { and: [{ id: { in: bagIds } }, { status: { equals: allocatedBagStatus } }] },
    data: { status: availableBagStatus },
    depth: 0,
    req,
    context: { skipInventoryAllocationHook: true },
  });
  return `Restored ${bagIds.length} bag(s) to AVAILABLE`;
}

export async function updateInventoryOnAllocate(
  inventoryID: string,
  allocatedVolume: number,
  req: PayloadRequest
) {
  if (!inventoryID || !allocatedVolume) return;

  const baseOptions = { depth: 0, req };

  const [inventory, { docs: bags }] = await Promise.all([
    req.payload.findByID({
      ...baseOptions,
      collection: 'inventories',
      id: inventoryID,
      select: { remainingVolume: true, reservedVolume: true },
    }),
    req.payload.find({
      ...baseOptions,
      collection: 'milkBags',
      where: { inventory: { equals: inventoryID } },
      limit: 1000,
      pagination: false,
      select: { status: true },
    }),
  ]);

  // If any bags remain AVAILABLE after this allocation, inventory stays AVAILABLE;
  // otherwise, mark as CONSUMED
  const hasAvailableBags = bags.some((b) => b.status === availableBagStatus);

  const updated = await req.payload.update({
    ...baseOptions,
    collection: 'inventories',
    id: inventoryID,
    data: {
      remainingVolume: Math.max(0, (inventory.remainingVolume ?? 0) - allocatedVolume),
      reservedVolume: (inventory.reservedVolume ?? 0) + allocatedVolume,
      status: hasAvailableBags ? 'AVAILABLE' : 'CONSUMED',
    },
    select: { remainingVolume: true, reservedVolume: true },
  });

  return `Updated inventory ${inventoryID}: ${updated.remainingVolume}ml remaining, ${updated.reservedVolume}ml reserved`;
}

export async function finalizeInventoryOnFulfilled(
  inventoryID: string,
  allocatedVolume: number,
  req: PayloadRequest
) {
  if (!inventoryID || !allocatedVolume) return;

  const baseOptions = { depth: 0, req };

  const inventory = await req.payload.findByID({
    ...baseOptions,
    collection: 'inventories',
    id: inventoryID,
  });

  // Move volume out of reservedVolume now that delivery is complete
  await req.payload.update({
    ...baseOptions,
    collection: 'inventories',
    id: inventoryID,
    data: {
      reservedVolume: Math.max(0, (inventory.reservedVolume ?? 0) - allocatedVolume),
    },
  });

  return `Finalized inventory ${inventoryID} for fulfilled allocation: reduced reservedVolume by ${allocatedVolume}ml`;
}

export async function restoreInventoryOnCancel(
  inventoryId: string,
  allocatedVolume: number,
  prevStatus: string,
  req: PayloadRequest
) {
  if (!inventoryId || !allocatedVolume) return;

  const baseOptions = { depth: 0, req };

  const inventory = await req.payload.findByID({
    ...baseOptions,
    collection: 'inventories',
    id: inventoryId,
    select: { remainingVolume: true, reservedVolume: true },
  });

  const updateData: Partial<Inventory> = { status: 'AVAILABLE' };

  // Return volume to remainingVolume regardless of previous state
  updateData.remainingVolume = (inventory.remainingVolume ?? 0) + allocatedVolume;

  // Only reduce reservedVolume if this was PENDING
  if (prevStatus === pendingStatus) {
    updateData.reservedVolume = Math.max(0, (inventory.reservedVolume ?? 0) - allocatedVolume);
  }

  await req.payload.update({
    ...baseOptions,
    collection: 'inventories',
    id: inventoryId,
    data: updateData,
  });

  return `Restored inventory ${inventoryId} after allocation cancellation`;
}

export async function updateRequestOnAllocate(
  requestId: string,
  bagIds: string[],
  allocatedVolume: number,
  req: PayloadRequest
) {
  if (!requestId || !bagIds.length) return;

  const baseOptions = { depth: 0, req };

  const request = await req.payload.findByID({
    ...baseOptions,
    collection: 'requests',
    id: requestId,
    select: { volumeNeeded: true, volumeFulfilled: true, details: { bags: true } },
  });

  const existingBags = extractID(request.details?.bags ?? []);
  const newVolumeFulfilled = (request.volumeFulfilled ?? 0) + allocatedVolume;
  const volumeNeeded = request.volumeNeeded ?? 0;

  const updateData: Partial<Request> = {
    volumeFulfilled: newVolumeFulfilled,
    details: {
      ...request.details,
      bags: Array.from(new Set([...existingBags, ...bagIds])), // merge and deduplicate bag IDs
    },
  };

  let message: string;

  if (newVolumeFulfilled >= volumeNeeded) {
    updateData.status = 'COMPLETED';
    updateData.completedAt = new Date().toISOString();
    message = `Request ${requestId} fully fulfilled → COMPLETED`;
  } else {
    updateData.status = 'AVAILABLE';
    message = `Request ${requestId} partially fulfilled (${newVolumeFulfilled}/${volumeNeeded}ml)`;
  }

  await req.payload.update({
    ...baseOptions,
    collection: 'requests',
    id: requestId,
    data: updateData,
  });

  return message;
}

export async function restoreRequestOnCancel(
  requestId: string,
  bagIds: string[],
  allocatedVolume: number,
  req: PayloadRequest
) {
  if (!requestId || !bagIds.length) return;

  const baseOptions = { depth: 0, req };

  const request = await req.payload.findByID({
    ...baseOptions,
    collection: 'requests',
    id: requestId,
    select: { volumeFulfilled: true, details: { bags: true } },
  });

  const bagIdSet = new Set(bagIds);
  const remainingBags = extractID(request.details?.bags ?? []).filter((id) => !bagIdSet.has(id));

  await req.payload.update({
    ...baseOptions,
    collection: 'requests',
    id: requestId,
    data: {
      volumeFulfilled: Math.max(0, (request.volumeFulfilled ?? 0) - allocatedVolume),
      status: 'AVAILABLE',
      details: { ...request.details, bags: remainingBags },
    },
  });

  return `Request ${requestId} restored after allocation cancellation`;
}
