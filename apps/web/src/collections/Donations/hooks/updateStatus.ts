import { Donation } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { CollectionBeforeReadHook } from 'payload';

export const updateStatus: CollectionBeforeReadHook<Donation> = async ({ doc, req, context }) => {
  // Check if the context has the skipDonationUpdate flag
  if (context.skipDonationUpdate) {
    req.payload.logger.info(
      { donationId: doc.id },
      'Skipping donation status update due to context flag'
    );
    return doc;
  }

  if (!doc?.details?.bags || doc.details.bags.length === 0) {
    req.payload.logger.warn(
      { donationId: doc.id },
      'No milk bags found for this donation, skipping status update'
    );
    return doc; // No bags to process, return the original document
  }

  req.payload.logger.info(
    { donationId: doc.id, bagsCount: doc.details.bags.length },
    'Updating donation status based on milk bags'
  );

  const bagDocs = await Promise.all(
    doc.details.bags.map((bag) => {
      return req.payload.findByID({
        collection: 'milkBags',
        id: extractID(bag),
        depth: 0,
        req,
      });
    })
  );

  const allBagsExpired = bagDocs.every((bag) => bag.status === 'EXPIRED');
  const totalVolume = bagDocs
    .filter((bag) => bag.status !== 'DISCARDED')
    .reduce((sum, bag) => sum + bag.volume, 0);
  const remainingVolume = bagDocs
    .filter((bag) => bag.status === 'AVAILABLE')
    .reduce((sum, bag) => sum + bag.volume, 0);

  let updatedStatus = doc.status;

  // Determine the new status based on conditions
  if (allBagsExpired && doc.status !== 'EXPIRED') {
    updatedStatus = 'EXPIRED';
  } else if (remainingVolume === 0 && doc.status !== 'FULLY_ALLOCATED') {
    updatedStatus = 'FULLY_ALLOCATED';
  } else if (remainingVolume < totalVolume && doc.status !== 'PARTIALLY_ALLOCATED') {
    updatedStatus = 'PARTIALLY_ALLOCATED';
  } else if (remainingVolume === totalVolume && doc.status !== 'AVAILABLE') {
    updatedStatus = 'AVAILABLE';
  }

  // Only update the database if there are changes to status, volume, or remainingVolume
  if (
    updatedStatus !== doc.status ||
    totalVolume !== doc.volume ||
    remainingVolume !== doc.remainingVolume
  ) {
    req.payload.logger.info(
      {
        donationId: doc.id,
        updatedStatus,
        totalVolume,
        remainingVolume,
      },
      'Updating donation status and volumes'
    );

    await req.payload.update({
      collection: 'donations',
      id: doc.id,
      data: {
        status: updatedStatus,
        volume: totalVolume,
        remainingVolume: remainingVolume,
      },
      req,
    });

    // Update the document in memory
    doc.status = updatedStatus;
    doc.volume = totalVolume;
    doc.remainingVolume = remainingVolume;
  }

  return doc;
};
