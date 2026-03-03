import { InventoryAllocationHookContext } from '@/lib/constants/hookContexts';
import { hookLogger, isHookRun, markHookRun } from '@lactalink/agents/payload';
import { INVENTORY_ALLOCATION_STATUS } from '@lactalink/enums';
import { InventoryAllocation } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionAfterChangeHook } from 'payload';
import {
  finalizeInventoryOnFulfilled,
  markBagsAsAllocated,
  restoreBagsToAvailable,
  restoreInventoryOnCancel,
  restoreRequestOnCancel,
  updateInventoryOnAllocate,
  updateRequestOnAllocate,
} from '../helpers';

const pendingStatus = INVENTORY_ALLOCATION_STATUS.PENDING.value;
const fulfilledStatus = INVENTORY_ALLOCATION_STATUS.FULFILLED.value;
const cancelledStatus = INVENTORY_ALLOCATION_STATUS.CANCELLED.value;

const hookFlag = InventoryAllocationHookContext.SkipAllocation;

/**
 * After an InventoryAllocation is created or updated, cascade changes to:
 *  - Parent Inventory: remainingVolume, reservedVolume, status
 *  - Linked MilkBags: status (AVAILABLE → ALLOCATED or ALLOCATED → AVAILABLE on cancel)
 *  - Linked Request: details.bags, volumeFulfilled, status
 */
export const afterChange: CollectionAfterChangeHook<InventoryAllocation> = async ({
  doc,
  previousDoc,
  operation,
  req,
  collection,
}) => {
  // Prevent hook loops triggered by our own updates
  if (isHookRun(req, hookFlag)) return doc;
  markHookRun(req, hookFlag);

  const logger = hookLogger(req, collection.slug, 'afterChange');
  const logInfo = (msg: string | undefined | null) => {
    if (msg) logger.info(msg);
  };

  const inventoryId = extractID(doc.inventory);
  const requestId = extractID(doc.request);
  const allocatedVolume = doc.allocatedVolume ?? 0;

  try {
    // On create, mark bags as ALLOCATED and update inventory/request accordingly
    if (operation === 'create') {
      const bagIds = extractID(doc.allocatedBags ?? []);

      await Promise.all([
        markBagsAsAllocated(bagIds, req).then(logInfo),
        updateInventoryOnAllocate(inventoryId, allocatedVolume, req).then(logInfo),
        updateRequestOnAllocate(requestId, bagIds, allocatedVolume, req).then(logInfo),
      ]);
    }

    // On update, handle status transitions:
    // PENDING / FULFILLED → CANCELLED: restore inventory and request, mark bags AVAILABLE
    // PENDING → FULFILLED: finalize inventory (reservedVolume → consumed)
    if (operation === 'update') {
      const prevStatus = previousDoc?.status;

      // PENDING / FULFILLED → CANCELLED: restore everything
      if (doc.status === cancelledStatus && prevStatus !== cancelledStatus) {
        const prevBagIds = extractID(previousDoc?.allocatedBags ?? []);
        const prevVolume = previousDoc?.allocatedVolume ?? 0;

        await Promise.all([
          restoreBagsToAvailable(prevBagIds, req).then(logInfo),
          restoreInventoryOnCancel(inventoryId, prevVolume, prevStatus ?? pendingStatus, req).then(
            logInfo
          ),
          restoreRequestOnCancel(requestId, prevBagIds, prevVolume, req).then(logInfo),
        ]);
      }

      // PENDING → FULFILLED: finalize bookkeeping (bags consumed by Transaction hook)
      if (doc.status === fulfilledStatus && prevStatus === pendingStatus) {
        await finalizeInventoryOnFulfilled(inventoryId, allocatedVolume, req).then(logInfo);
      }
    }
  } catch (error) {
    logger.error(error, `Error after ${operation} of InventoryAllocation: ${extractID(doc)}`);
  }

  return doc;
};
