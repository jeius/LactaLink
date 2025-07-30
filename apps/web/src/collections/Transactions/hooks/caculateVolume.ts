import { Transaction } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { CollectionBeforeReadHook } from 'payload';

/**
 * Hook to calculate the total volume of matched milk bags for a transaction.
 *
 * This hook is executed before reading a transaction document. It calculates
 * the `matchedVolume` property based on the `matchedBags` field in the document.
 * If no `matchedBags` are present or the list is empty, the `matchedVolume` is set to 0.
 * Otherwise, it retrieves the volumes of the matched milk bags from the `milkBags` collection
 * and sums them up to compute the total volume.
 *
 * @returns The updated transaction document with the calculated `matchedVolume`.
 */
export const calculateVolume: CollectionBeforeReadHook<Transaction> = async ({ req, doc }) => {
  if (!doc.matchedBags) {
    return doc;
  }

  const bagIds = extractID(doc.matchedBags);

  if (bagIds.length === 0) {
    doc.matchedVolume = 0;
    return doc;
  }

  const { docs: bags } = await req.payload.find({
    collection: 'milkBags',
    where: { id: { in: bagIds } },
    depth: 0,
    select: { volume: true },
  });

  doc.matchedVolume = bags.reduce((total, bag) => total + (bag.volume || 0), 0);

  return doc;
};
