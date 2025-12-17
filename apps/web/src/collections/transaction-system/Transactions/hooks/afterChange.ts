import { DONATION_REQUEST_STATUS, MILK_BAG_STATUS } from '@lactalink/enums';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionAfterChangeHook, PayloadRequest } from 'payload';

const matchedStatus = DONATION_REQUEST_STATUS.MATCHED.value;
const allocatedStatus = MILK_BAG_STATUS.ALLOCATED.value;

export const afterChange: CollectionAfterChangeHook<Transaction> = async ({
  doc,
  req,
  operation,
  previousDoc,
}) => {
  const { user } = req;
  if (!user?.profile) return doc;

  // On update operations
  if (operation === 'update') {
    // Update read records
    const { docs } = await req.payload.delete({
      collection: 'transaction-reads',
      where: { transaction: { equals: doc.id } },
      req,
    });

    req.payload.logger.info(
      `Deleted ${docs.length} transaction read records for transaction ${doc.id}`
    );

    // Add record in status history if status changed
    if (previousDoc?.status !== doc.status) {
      const isSender = isEqualProfiles(user.profile, doc.sender);
      const isReceiver = isEqualProfiles(user.profile, doc.recipient);
      const notes = `Status changed by ${isSender ? 'sender' : isReceiver ? 'receiver' : 'system'}.`;

      const history = await req.payload.create({
        collection: 'transaction-status-histories',
        data: { status: doc.status, transaction: doc.id, notes: notes },
      });

      req.payload.logger.info(
        `Created status history record ${history.id} for transaction ${doc.id} with status ${doc.status}`
      );
    }
  }

  // On create operations
  if (operation === 'create') {
    await Promise.all([
      updateDonation(extractID(doc.donation), req),
      updateRequest(extractID(doc.request), req),
      updateMilkBagsStatus(extractID(doc.milkBags), req),
    ]);
  }

  return doc;
};

async function updateDonation(id: string | null | undefined, req: PayloadRequest) {
  if (!id) return Promise.resolve(null);
  return req.payload
    .update({
      collection: 'donations',
      req,
      data: { status: matchedStatus },
      where: { id: { equals: id } },
      depth: 0,
    })
    .then(() => req.payload.logger.info(`Donation ${id} status updated to ${matchedStatus}`));
}

async function updateRequest(id: string | null | undefined, req: PayloadRequest) {
  if (!id) return Promise.resolve(null);
  return req.payload
    .update({
      collection: 'requests',
      req,
      data: { status: matchedStatus },
      where: { id: { equals: id } },
      depth: 0,
    })
    .then(() => req.payload.logger.info(`Request ${id} status updated to ${matchedStatus}`));
}

async function updateMilkBagsStatus(ids: string[], req: PayloadRequest) {
  if (!ids || ids.length === 0) return Promise.resolve(null);
  return req.payload
    .update({
      collection: 'milkBags',
      req,
      data: { status: allocatedStatus },
      where: { id: { in: ids } },
      depth: 0,
    })
    .then(() =>
      req.payload.logger.info(`Updated status of ${ids.length} milk bags to ${allocatedStatus}`)
    );
}
