import { hookLogger } from '@lactalink/agents/payload';
import { Transaction, TransactionStatusHistory } from '@lactalink/types/payload-generated-types';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import { PayloadRequest } from 'payload';

/**
 * Creates a new transaction status history record.
 *
 * @param doc - The transaction document being processed, which contains the current status and
 * related information.
 *
 * @param previousDoc - The previous version of the transaction document before the update,
 * used to compare status changes.
 *
 * @param req - The Payload request to handle operations, including access to the user profile
 * for determining the actor of the status change.
 *
 * @param logger - Optional logger for structured logging within the function, useful for debugging
 *  and monitoring the creation of status history records.
 *
 * @returns A promise that resolves to the newly created `TransactionStatusHistory` record if a
 * status change occurred, or null if there was no status change or if the user profile is not available.
 */
export async function createStatusHistoryRecord(
  doc: Transaction,
  previousDoc: Transaction | null,
  req: PayloadRequest,
  logger?: ReturnType<typeof hookLogger>
): Promise<TransactionStatusHistory | null> {
  const { user } = req;
  if (!user?.profile) return null;

  // Only proceed if status changed
  if (previousDoc?.status === doc.status) return null;

  const isSender = isEqualProfiles(user.profile, doc.sender);
  const isReceiver = isEqualProfiles(user.profile, doc.recipient);

  const actor = isSender ? 'sender' : isReceiver ? 'receiver' : 'system';
  const notes = `Status changed by ${actor}.`;

  const history = await req.payload.create({
    collection: 'transaction-status-histories',
    data: { status: doc.status, transaction: doc.id, notes: notes },
    depth: 0,
    req,
  });

  logger?.info(
    `Created status history record ${history.id} for transaction ${doc.id} with status ${doc.status}`
  );

  return history;
}
