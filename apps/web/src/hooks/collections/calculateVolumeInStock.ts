import { Hospital, MilkBank } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { CollectionBeforeReadHook } from 'payload';

export const calculateVolumeInStock: CollectionBeforeReadHook<Hospital | MilkBank> = async ({
  req,
  doc,
}) => {
  if (!doc.inventory || !doc.inventory.docs?.length) return doc;

  const inventoryIDs = extractID(doc.inventory.docs);
  const inventoryItems = await req.payload.find({
    collection: 'inventory',
    where: { id: { in: inventoryIDs } },
    depth: 0,
    select: { remainingVolume: true },
  });

  const totalRemainingVolume = inventoryItems.docs.reduce((total, item) => {
    return total + (item.remainingVolume || 0);
  }, 0);

  doc.totalVolume = totalRemainingVolume;

  return doc;
};
