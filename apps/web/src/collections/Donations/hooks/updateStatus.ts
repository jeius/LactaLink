import { getUpdatedDonationStatus } from '@/lib/utils/collections/getUpdatedDonationStatus';
import { Donation } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import _ from 'lodash';
import { CollectionBeforeChangeHook, CollectionBeforeReadHook } from 'payload';

export const updateStatus: CollectionBeforeChangeHook<Donation> = async ({
  data,
  req,
  context,
  operation,
}) => {
  // Check if the context has the skipDonationUpdate flag
  if (context.skipDonationUpdateHook || operation !== 'update') {
    req.payload.logger.info(
      { donationId: data.id },
      'Skipping donation status update due to context flag'
    );
    return data;
  }

  if (!data?.details?.bags || data.details.bags.length === 0) {
    req.payload.logger.warn(
      { donationId: data.id },
      'No milk bags found for this donation, skipping status update'
    );
    return data; // No bags to process, return the original document
  }

  req.payload.logger.info(
    { donationId: data.id, bagsCount: data.details.bags.length },
    'Updating donation status based on milk bags'
  );

  const { docs: milkBags } = await req.payload.find({
    collection: 'milkBags',
    depth: 0,
    req,
    where: { id: { in: data.details.bags.map(extractID) } },
  });

  const { volume, remainingVolume, status } = getUpdatedDonationStatus(milkBags, data.status);

  // Only update the database if there are changes to status, volume, or remainingVolume
  if (
    status !== data.status ||
    volume !== data.volume ||
    remainingVolume !== data.remainingVolume
  ) {
    req.payload.logger.info(
      {
        donationId: data.id,
        updatedStatus: status,
        totalVolume: volume,
        remainingVolume,
      },
      'Updating donation status and volumes'
    );

    data.status = status;
    data.volume = volume;
    data.remainingVolume = remainingVolume;
  }

  return data;
};

export const checkStatus: CollectionBeforeReadHook<Donation> = async ({ req, doc: data }) => {
  if (req.context.skipDonationUpdateHook) {
    req.payload.logger.info(
      { donationId: data.id },
      'Skipping donation status update due to context flag'
    );
    return data;
  }

  if (!data?.details?.bags || data.details.bags.length === 0) {
    req.payload.logger.warn(
      { donationId: data.id },
      'No milk bags found for this donation, skipping status update'
    );
    return data; // No bags to process, return the original document
  }

  req.payload.logger.info(
    { donationId: data.id, bagsCount: data.details.bags.length },
    'Updating donation status based on milk bags'
  );

  const { docs: milkBags } = await req.payload.find({
    collection: 'milkBags',
    depth: 0,
    req,
    where: { id: { in: data.details.bags.map(extractID) } },
  });

  const oldState = {
    volume: data.volume,
    remainingVolume: data.remainingVolume,
    status: data.status,
  };

  const newState = getUpdatedDonationStatus(milkBags, data.status);

  // Only update the database if there are changes to status, volume, or remainingVolume
  if (!_.isEqual(oldState, newState)) {
    req.payload.logger.info(
      {
        donationId: data.id,
        updatedStatus: newState.status,
        totalVolume: newState.volume,
        remainingVolume: newState.remainingVolume,
      },
      'Updating donation status and volumes'
    );

    data.status = newState.status;
    data.volume = newState.volume;
    data.remainingVolume = newState.remainingVolume;

    // Persist to database
    req.context.skipDonationUpdateHook = true; // Prevent infinite loop

    await req.payload.update({
      collection: 'donations',
      id: data.id,
      req,
      data: newState,
      depth: 0,
    });
  }

  return data;
};
