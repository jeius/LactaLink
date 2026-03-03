import { INVENTORY_ALLOCATION_STATUS, MILK_BAG_STATUS } from '@lactalink/enums';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { PayloadRequest } from 'payload';

const milkAllocatedStatus = MILK_BAG_STATUS.ALLOCATED.value;
const consumedStatus = MILK_BAG_STATUS.CONSUMED.value;
const allocationFulfilledStatus = INVENTORY_ALLOCATION_STATUS.FULFILLED.value;
const allocationPendingStatus = INVENTORY_ALLOCATION_STATUS.PENDING.value;

/**
 * Update the status of the specified milk bags to CONSUMED, but only if they are currently ALLOCATED.
 */
export async function consumeMilkBags(bagIds: string[], req: PayloadRequest) {
  if (bagIds.length === 0) return;

  const { docs } = await req.payload.update({
    collection: 'milkBags',
    data: { status: consumedStatus },
    where: {
      and: [{ id: { in: bagIds } }, { status: { equals: milkAllocatedStatus } }],
    },
    depth: 0,
    req,
  });

  req.payload.logger.info(`Marked ${docs.length} allocated bag(s) as CONSUMED`);
}

/**
 * When a transaction reaches COMPLETED, transition every ALLOCATED bag linked to the
 * transaction's request (if any) from ALLOCATED → CONSUMED.
 */
export async function consumeRequestBags(
  doc: Pick<Transaction, 'id' | 'request'>,
  req: PayloadRequest
) {
  const requestId = extractID(doc.request);
  if (!requestId) return;

  try {
    const request = await req.payload.findByID({
      collection: 'requests',
      id: requestId,
      depth: 0,
      select: { details: { bags: true } },
    });

    const bagIds: string[] = extractID(request.details?.bags ?? []);

    await consumeMilkBags(bagIds, req);

    req.payload.logger.info(
      `Transaction ${doc.id} completed — marked allocated bags as CONSUMED for request ${requestId}`
    );

    // Mark the linked InventoryAllocation(s) as FULFILLED
    await req.payload.update({
      collection: 'inventory-allocations',
      data: { status: allocationFulfilledStatus },
      where: {
        and: [{ request: { equals: requestId } }, { status: { equals: allocationPendingStatus } }],
      },
      depth: 0,
      req,
    });

    req.payload.logger.info(
      `Marked linked InventoryAllocations as FULFILLED for request ${requestId}`
    );
  } catch (error) {
    req.payload.logger.error(error, `consumeAllocatedBags failed for transaction ${doc.id}:`);
  }
}
