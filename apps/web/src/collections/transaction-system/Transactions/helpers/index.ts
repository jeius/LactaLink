/**
 * Helper functions for transaction hooks
 * These functions are used in the afterChange hook for transactions to handle side effects such as updating related records and creating inventory entries.
 */

import { hookLogger } from '@lactalink/agents/payload';
import { DONATION_REQUEST_STATUS, MILK_BAG_STATUS } from '@lactalink/enums';
import { Donation, MilkBag, Request, Transaction } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { PayloadRequest } from 'payload';

export * from './createStatusHistoryRecord';
export * from './markDonationAsComplete';
export * from './markRequestAsComplete';

const MATCHED_STATUS = DONATION_REQUEST_STATUS.MATCHED.value;
const MILK_ALLOCATED_STATUS = MILK_BAG_STATUS.ALLOCATED.value;

/**
 * Marks a donation as matched by updating its status field to `MATCHED`.
 * If no donation is provided, the function will log a message and resolve without making any updates.
 *
 * @param donation - The donation to be marked as matched, which can be a string ID, a `Donation`, or null/undefined.
 * @param req - The Payload request object, used to perform the update operation on the donation.
 * @param logger - Optional logger for logging the operation result. If provided, logs the ID of the updated donation.
 *
 * @returns A promise that resolves when the update operation is complete. The promise will reject if the update operation fails.
 */
export async function markDonationAsMatched(
  donation: string | Donation | null | undefined,
  req: PayloadRequest,
  logger?: ReturnType<typeof hookLogger>
) {
  if (!donation) {
    logger?.info('No donation provided, skipping donation status update.');
    return Promise.resolve();
  }
  return req.payload
    .update({
      collection: 'donations',
      id: extractID(donation),
      req,
      depth: 0,
      data: { status: MATCHED_STATUS },
    })
    .then(({ id }) => logger?.info(`Donation ${id} status updated to ${MATCHED_STATUS}`));
}

/**
 * Marks a request as matched by updating its status field to `MATCHED`.
 * If no request is provided, the function will log a message and resolve without making any updates.
 *
 * @param request - The request to be marked as matched, which can be a string ID, a `Request`, or null/undefined.
 * @param req - The Payload request object, used to perform the update operation on the request.
 * @param logger - Optional logger for logging the operation result. If provided, logs the ID of the updated request.
 *
 * @return A promise that resolves when the update operation is complete. The promise will reject if the update operation fails.
 */
export async function markRequestAsMatched(
  request: string | Request | null | undefined,
  req: PayloadRequest,
  logger?: ReturnType<typeof hookLogger>
) {
  if (!request) {
    logger?.info('No request provided, skipping request status update.');
    return Promise.resolve();
  }
  return req.payload
    .update({
      collection: 'requests',
      id: extractID(request),
      req,
      depth: 0,
      data: { status: MATCHED_STATUS },
    })
    .then(({ id }) => logger?.info(`Request ${id} status updated to ${MATCHED_STATUS}`));
}
/**
 * Marks the specified milk bags as allocated by updating their status field.
 * If no milk bags are provided, the function will log a message and resolve without making any updates.
 *
 * @param milkbags - An array of milk bag IDs or `MilkBag` objects to be marked as allocated.
 * @param req - The Payload request object used to perform the update operation on the milk bags.
 * @param logger - Optional logger for logging the operation result. If provided, logs the number of milk bags updated.
 *
 * @returns A promise that resolves when the update operation is complete. The promise will reject if the update operation fails.
 */
export async function markBagsAsAllocated(
  milkbags: (string | MilkBag)[],
  req: PayloadRequest,
  logger?: ReturnType<typeof hookLogger>
) {
  if (!milkbags || milkbags.length === 0) {
    logger?.info('No milk bags to allocate, skipping status update...');
    return Promise.resolve();
  }

  return req.payload
    .update({
      collection: 'milkBags',
      req,
      data: { status: MILK_ALLOCATED_STATUS },
      where: { id: { in: extractID(milkbags) } },
      depth: 0,
    })
    .then(({ docs }) =>
      logger?.info(`Updated ${docs.length} milk bags to ${MILK_ALLOCATED_STATUS}`)
    );
}

/**
 * Clears all transaction read records for a given transaction ID.
 *
 * @param transaction - The `Transaction` or ID for which to clear read records
 * @param req - The Payload request object, used to perform the delete operation on transaction reads
 * @param logger - Optional logger for logging the operation result
 *
 * @return A promise that resolves when the delete operation is complete. The promise will reject if the delete operation fails.
 *
 */
export async function clearTransactionReads(
  transaction: string | Transaction,
  req: PayloadRequest,
  logger?: ReturnType<typeof hookLogger>
) {
  const transactionID = extractID(transaction);
  return req.payload
    .delete({
      collection: 'transaction-reads',
      where: { transaction: { equals: transactionID } },
      req,
      depth: 0,
    })
    .then(({ docs }) =>
      logger?.info(
        `Deleted ${docs.length} transaction read records for transaction ${transactionID}`
      )
    );
}
