import { MilkBagEvent } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionBeforeChangeHook, PayloadRequest } from 'payload';

export const beforeChange: CollectionBeforeChangeHook<MilkBagEvent> = async ({
  data,
  req,
  operation,
}) => {
  if (operation === 'create') {
    const milkBagID = extractID(data.milkBag);
    if (milkBagID) {
      const latestSequenceNumber = await getLatestSequenceNumber(milkBagID, req);
      data.sequenceNumber = latestSequenceNumber + 1;
    }
  }

  if (operation === 'update') {
  }

  return data;
};

async function getLatestSequenceNumber(milkBagID: string, req: PayloadRequest): Promise<number> {
  const { docs } = await req.payload.find({
    collection: 'milk-bag-events',
    select: { sequenceNumber: true },
    where: { milkBag: { equals: milkBagID } },
    sort: '-sequenceNumber',
    limit: 1,
    depth: 0,
    req,
  });

  return docs.length > 0 ? (docs[0]!.sequenceNumber ?? 0) : 0;
}
