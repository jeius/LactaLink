import { hookLogger } from '@lactalink/agents/payload';
import { INVENTORY_ALLOCATION_STATUS, MILK_BAG_STATUS } from '@lactalink/enums';
import { Request } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { PayloadRequest } from 'payload';

// Constants for milk bag status
const MILK_ALLOCATED_STATUS = MILK_BAG_STATUS.ALLOCATED.value;
const MILK_CONSUMED_STATUS = MILK_BAG_STATUS.CONSUMED.value;

// Constants for inventory allocation status
const FULFILLED_STATUS = INVENTORY_ALLOCATION_STATUS.FULFILLED.value;
const PENDING_STATUS = INVENTORY_ALLOCATION_STATUS.PENDING.value;

/**
 * Consumes the milk bags allocated to a request by updating their status to CONSUMED, but only if they are currently ALLOCATED.
 *
 * @param request - The request (or request ID) for which the allocated bags should be consumed.
 * @param req - The Payload request object used to perform the operations.
 * @param logger - Optional logger for structured logging within the function.
 * @returns A promise that resolves once the operation is complete. The promise rejects if any of the underlying Payload operations fail.
 */
export async function consumeRequestBags(
  request: string | Request,
  req: PayloadRequest,
  logger?: ReturnType<typeof hookLogger>
): Promise<void> {
  const requestId = extractID(request);
  if (!requestId) return;

  try {
    const requestDoc =
      extractCollection(request) ||
      (await req.payload.findByID({
        collection: 'requests',
        id: requestId,
        depth: 0,
        select: { details: { bags: true } },
      }));

    const bagIds = extractID(requestDoc.details?.bags ?? []);
    await consumeMilkBags(bagIds, req).then((docs) =>
      logger?.info(
        `Marked ${docs?.length ?? 0} allocated bags as '${MILK_CONSUMED_STATUS}' for request ${requestId}`
      )
    );

    // Also update the status of the related inventory allocations to FULFILLED if they are currently PENDING
    await req.payload
      .update({
        collection: 'inventory-allocations',
        data: { status: FULFILLED_STATUS },
        where: {
          and: [{ request: { equals: requestId } }, { status: { equals: PENDING_STATUS } }],
        },
        depth: 0,
        limit: 0, // Update all matching allocations
        req,
      })
      .then(() =>
        logger?.info(`Marked linked InventoryAllocations as FULFILLED for request ${requestId}`)
      );
  } catch (error) {
    logger?.error(error, `Failed consuming allocated bags for request ${requestId}`);
  }
}

/**
 * Update the status of the specified milk bags to CONSUMED, but only if they are currently ALLOCATED.
 *
 * @param bagIDs - An array of milk bag IDs to be updated. Only bags with status ALLOCATED will be updated to CONSUMED.
 * @param req - The Payload request object used to perform the update operation.
 * @returns The updated milk bags that were successfully marked as CONSUMED. Bags that were not in ALLOCATED status will be ignored and not returned.
 */
async function consumeMilkBags(bagIDs: string[], req: PayloadRequest) {
  if (bagIDs.length === 0) return;

  const { docs } = await req.payload.update({
    collection: 'milkBags',
    where: {
      and: [{ id: { in: bagIDs } }, { status: { equals: MILK_ALLOCATED_STATUS } }],
    },
    data: { status: MILK_CONSUMED_STATUS },
    depth: 0,
    limit: 0, // Update all matching allocations
    req,
  });

  return docs;
}
