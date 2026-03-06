import { hookLogger } from '@lactalink/agents/payload';
import {
  DONATION_REQUEST_STATUS,
  INVENTORY_ALLOCATION_STATUS,
  MILK_BAG_STATUS,
} from '@lactalink/enums';
import { Request } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { PayloadRequest } from 'payload';

// Constants for milk bag status
const MILK_ALLOCATED_STATUS = MILK_BAG_STATUS.ALLOCATED.value;
const MILK_CONSUMED_STATUS = MILK_BAG_STATUS.CONSUMED.value;

// Constants for inventory allocation status
const FULFILLED_STATUS = INVENTORY_ALLOCATION_STATUS.FULFILLED.value;
const PENDING_STATUS = INVENTORY_ALLOCATION_STATUS.PENDING.value;

// Constants for request status
const REQUEST_COMPLETED_STATUS = DONATION_REQUEST_STATUS.COMPLETED.value;

/**
 * Consumes the milk bags allocated to a request by updating their status to CONSUMED, but only if they are currently ALLOCATED.
 *
 * @param request - The request (or request ID) for which the allocated bags should be consumed.
 * @param req - The Payload request object used to perform the operations.
 * @param logger - Optional logger for structured logging within the function.
 * @returns A promise that resolves once the operation is complete. The promise rejects if any of the underlying Payload operations fail.
 */
export async function markRequestAsComplete(
  request: string | Request | null | undefined,
  req: PayloadRequest,
  logger?: ReturnType<typeof hookLogger>
): Promise<void> {
  if (!request) {
    logger?.info('No request provided, skipping request completion process.');
    return;
  }

  const requestID = extractID(request);

  try {
    const requestDoc = await req.payload.update({
      collection: 'requests',
      id: requestID,
      depth: 0,
      select: { details: true },
      data: { status: REQUEST_COMPLETED_STATUS },
    });

    logger?.info(`Updated donation status to "${REQUEST_COMPLETED_STATUS}"`, { requestID });

    await Promise.all([
      consumeMilkBags(requestDoc, req, logger),
      fulfillPendingAllocations(requestID, req, logger),
      // Add more parallel operations here if needed in the future...
    ]);
  } catch (error) {
    logger?.error(error, `Failed completing request ${requestID}`);
    throw error;
  }
}

/**
 * Helper function to update the status of the specified milk bags to `CONSUMED`, but only if
 * they are currently `ALLOCATED`.
 */
async function consumeMilkBags(
  request: Pick<Request, 'details' | 'id'>,
  req: PayloadRequest,
  logger?: ReturnType<typeof hookLogger>
) {
  const bagIDs = extractID(request.details?.bags ?? []);
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

  logger?.info(
    `Marked ${docs.length} allocated bags as '${MILK_CONSUMED_STATUS}' for request ${request.id}`
  );

  return docs;
}

/**
 * Helper function to update the status of any pending inventory allocations linked to the
 * request to `FULFILLED`.
 */
async function fulfillPendingAllocations(
  requestId: string,
  req: PayloadRequest,
  logger?: ReturnType<typeof hookLogger>
) {
  await req.payload.update({
    collection: 'inventory-allocations',
    data: { status: FULFILLED_STATUS },
    where: {
      and: [{ request: { equals: requestId } }, { status: { equals: PENDING_STATUS } }],
    },
    depth: 0,
    limit: 0,
    req,
  });
  logger?.info(`Marked linked InventoryAllocations as FULFILLED for request ${requestId}`);
}
