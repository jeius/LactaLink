import { MILK_BAG_OWNERSHIP_TRANSFER_REASONS } from '@lactalink/enums';
import { MilkBag, MilkBagOwnershipHistory } from '@lactalink/types';
import _ from 'lodash';
import { CollectionBeforeChangeHook } from 'payload';

export const updateOwnershipHistory: CollectionBeforeChangeHook<MilkBag> = ({
  originalDoc,
  data,
  operation,
}) => {
  if (operation !== 'update' || !originalDoc) return data;

  // If ownership is being updated
  if (data.owner && !_.isEqual(originalDoc.owner, data.owner)) {
    const newOwnershipRecord: NonNullable<MilkBagOwnershipHistory>[number] = {
      previousOwner: originalDoc.owner,
      newOwner: data.owner,
      transferReason: MILK_BAG_OWNERSHIP_TRANSFER_REASONS.DONATION_COMPLETED.value,
      transferredAt: new Date().toISOString(),
    };

    // Append to ownership history
    data.ownershipHistory = [...(originalDoc.ownershipHistory || []), newOwnershipRecord];
  }

  return data;
};
