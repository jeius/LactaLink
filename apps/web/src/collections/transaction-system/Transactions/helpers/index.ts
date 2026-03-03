import { DONATION_REQUEST_STATUS, MILK_BAG_STATUS } from '@lactalink/enums';
import { PayloadRequest } from 'payload';

const matchedStatus = DONATION_REQUEST_STATUS.MATCHED.value;
const milkAllocatedStatus = MILK_BAG_STATUS.ALLOCATED.value;

export async function updateDonationOnCreate(id: string | null | undefined, req: PayloadRequest) {
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

export async function updateRequestOnCreate(id: string | null | undefined, req: PayloadRequest) {
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

export async function allocateMilkBags(ids: string[], req: PayloadRequest) {
  if (!ids || ids.length === 0) return Promise.resolve(null);
  return req.payload
    .update({
      collection: 'milkBags',
      req,
      data: { status: milkAllocatedStatus },
      where: { id: { in: ids } },
      depth: 0,
    })
    .then(() =>
      req.payload.logger.info(`Updated ${ids.length} milk bags to ${milkAllocatedStatus}`)
    );
}
