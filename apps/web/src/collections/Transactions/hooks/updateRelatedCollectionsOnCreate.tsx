import { DONATION_REQUEST_STATUS, MILK_BAG_STATUS } from '@lactalink/enums';
import { Transaction } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { CollectionAfterChangeHook, PayloadRequest } from 'payload';

const matchedStatus = DONATION_REQUEST_STATUS.MATCHED.value;

export const updateRelatedCollectionsOnCreate: CollectionAfterChangeHook<Transaction> = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return doc;

  await Promise.all([
    updateDonationRequest(req, doc),
    updateMilkBagsStatus(extractID(doc.matchedBags), req),
  ]);

  return doc;
};

async function updateDonationRequest(req: PayloadRequest, doc: Transaction) {
  if (doc.donation && doc.request) {
    await Promise.all([
      updateDonation(extractID(doc.donation), req),
      updateRequest(extractID(doc.request), req, doc),
    ]);
  } else if (doc.donation) {
    await updateDonation(extractID(doc.donation), req);
  } else if (doc.request) {
    await updateRequest(extractID(doc.request), req, doc);
  }
}

async function updateDonation(id: string, req: PayloadRequest) {
  return req.payload.update({
    collection: 'donations',
    req,
    data: { status: matchedStatus },
    where: { id: { equals: id } },
    depth: 0,
    select: {},
  });
}

async function updateRequest(id: string, req: PayloadRequest, doc: Transaction) {
  return req.payload.update({
    collection: 'requests',
    req,
    data: { status: matchedStatus, details: { bags: extractID(doc.matchedBags) } },
    where: { id: { equals: id } },
    depth: 0,
    select: {},
  });
}

async function updateMilkBagsStatus(ids: string[], req: PayloadRequest) {
  return req.payload.update({
    collection: 'milkBags',
    req,
    data: { status: MILK_BAG_STATUS.ALLOCATED.value },
    where: { id: { in: ids } },
    depth: 0,
    select: {},
  });
}
