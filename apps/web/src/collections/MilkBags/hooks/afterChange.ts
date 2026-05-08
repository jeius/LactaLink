import { hookLogger } from '@lactalink/agents/payload';
import { MilkBag } from '@lactalink/types/payload-generated-types';
import { CollectionAfterChangeHook } from 'payload';
import { createEventOnOwnershipTransfer, deleteRemovedImage } from '../helpers';
import { updateInventoryOnExpiry } from '../helpers/updateInventoryOnExpiry';
import { updateRelatedListingsOnExpiry } from '../helpers/updateRelatedListingsOnExpiry';

export const afterChange: CollectionAfterChangeHook<MilkBag> = async ({
  doc,
  previousDoc,
  operation,
  collection,
  req,
}) => {
  // Create operations
  if (operation === 'create') {
    // Create operation hooks here if needed
  }

  // Update operations
  if (operation === 'update') {
    const logger = hookLogger(req, collection.slug, 'afterUpdate');
    await Promise.all([
      deleteRemovedImage(doc, previousDoc, req),
      updateInventoryOnExpiry(doc, previousDoc, req),
      createEventOnOwnershipTransfer(doc, previousDoc, req),
      updateRelatedListingsOnExpiry({ doc, previousDoc, req, logger }),
    ]);
  }

  return doc;
};
