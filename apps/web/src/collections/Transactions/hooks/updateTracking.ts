import { Transaction } from '@lactalink/types';
import { CollectionBeforeChangeHook } from 'payload';

/**
 * A hook that updates the tracking information of a transaction before a change operation.
 * This hook is triggered only during an 'update' operation and modifies the `tracking` field
 * based on the transaction's status and its history.
 *
 * @returns {Transaction} The updated transaction data with modified tracking information.
 *
 * @remarks
 * - Updates the `tracking` field with timestamps for specific statuses (`COMPLETED`, `DELIVERED`, `FAILED`, `CANCELLED`).
 * - Maintains a `statusHistory` array in the `tracking` field to record changes in status along with timestamps.
 * - Ensures that the `tracking` field is preserved and updated correctly even if it was not provided in the new data.
 */
export const updateTracking: CollectionBeforeChangeHook<Transaction> = ({
  data,
  originalDoc,
  operation,
}) => {
  if (operation !== 'update' || !originalDoc || !data.status) {
    return data;
  }

  const tracking: NonNullable<Transaction['tracking']> =
    data.tracking || originalDoc.tracking || {};

  switch (data.status) {
    case 'COMPLETED':
      tracking.completedAt = new Date().toISOString();
      break;
    case 'DELIVERED':
      tracking.deliveredAt = new Date().toISOString();
      break;
    case 'FAILED':
      tracking.failedAt = new Date().toISOString();
      break;
    case 'CANCELLED':
      tracking.cancelledAt = new Date().toISOString();
      break;
  }

  if (originalDoc.status !== data.status) {
    const statusHistory = tracking.statusHistory || [];
    tracking.statusHistory = [
      ...statusHistory,
      {
        status: data.status,
        timestamp: new Date().toISOString(),
      },
    ];
  }

  data.tracking = tracking;

  return data;
};
