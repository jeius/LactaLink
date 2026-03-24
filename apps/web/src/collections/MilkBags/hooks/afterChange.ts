import { MilkBag } from '@lactalink/types/payload-generated-types';
import { CollectionAfterChangeHook } from 'payload';
import { createEventOnOwnershipTransfer, deleteRemovedImage } from '../helpers';
import { updateInventoryOnExpiry } from '../helpers/updateInventoryOnExpiry';

export const afterChange: CollectionAfterChangeHook<MilkBag> = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  // Create operations
  if (operation === 'create') {
    // Create operation hooks here if needed
  }

  // Update operations
  if (operation === 'update') {
    await Promise.all([
      deleteRemovedImage(doc, previousDoc, req),
      updateInventoryOnExpiry(doc, previousDoc, req),
      createEventOnOwnershipTransfer(doc, previousDoc, req),
    ]);
  }

  return doc;
};
