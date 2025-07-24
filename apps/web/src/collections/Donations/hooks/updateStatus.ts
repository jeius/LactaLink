import { getUpdatedDonationStatus } from '@/lib/utils/collections/getUpdatedDonationStatus';
import { Donation } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import _ from 'lodash';
import { CollectionBeforeReadHook } from 'payload';

export const checkStatus: CollectionBeforeReadHook<Donation> = async ({ req, doc: data }) => {
  if (req.context.skipStatusCheck) {
    req.payload.logger.info(
      { donationId: data.id },
      'Skipping donation status CHECK due to context flag'
    );
    return data;
  }

  // Ensure we don't check the status again in the same request
  req.context.skipStatusCheck = true; // Prevent infinite loop

  if (!data?.details?.bags || data.details.bags.length === 0) {
    req.payload.logger.warn(
      { donationId: data.id },
      'No milk bags found for this donation, skipping status check'
    );
    return data; // No bags to process, return the original document
  }

  req.payload.logger.info(
    { donationId: data.id, bagsCount: data.details.bags.length },
    'Checking donation status based on milk bags'
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

  if (_.isEqual(oldState, newState)) {
    // No changes detected, return the original document
    return data;
  }

  // Log the update if there are changes
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

  if (req.context.skipDonationUpdateHook) {
    // If the skipDonationUpdateHook is set, we won't update the database
    req.payload.logger.info(
      { donationId: data.id },
      'Skipping donation status UPDATE due to context flag'
    );
    return data;
  }

  // Ensure we don't update the status again in the same request
  req.context.skipDonationUpdateHook = true; // Prevent infinite loop

  // Persist to database
  await req.payload.update({
    collection: 'donations',
    id: data.id,
    req,
    data: newState,
    depth: 0,
    overrideLock: false,
  });

  return data;
};
