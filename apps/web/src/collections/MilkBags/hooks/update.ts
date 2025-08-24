import { MILK_BAG_STATUS } from '@lactalink/enums';
import { MilkBag } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionBeforeReadHook,
} from 'payload';

const draftStatus = MILK_BAG_STATUS.DRAFT.value;
const availableStatus = MILK_BAG_STATUS.AVAILABLE.value;

export const updateStatus: CollectionBeforeChangeHook<MilkBag> = ({
  operation,
  data,
  originalDoc,
}) => {
  if (operation !== 'update') {
    return data;
  }

  // If the bagImage is provided and the original status was 'DRAFT', change status to 'AVAILABLE'
  if (data.bagImage && originalDoc?.status === draftStatus) {
    data.status = availableStatus;
  }

  // If the status was changed to 'DRAFT', set bagImage to null
  if (originalDoc?.status !== draftStatus && data.status === draftStatus) {
    data.bagImage = null;
  }

  // If the bagImage is removed, set status to 'DRAFT'
  if (!data.bagImage && originalDoc?.bagImage) {
    data.status = draftStatus;
  }

  return data;
};

export const deleteRemovedImage: CollectionAfterChangeHook<MilkBag> = async ({
  doc,
  previousDoc,
  req,
  operation,
}) => {
  if (operation !== 'update') {
    return doc;
  }

  // If the bagImage was removed, delete the image file
  if (previousDoc.bagImage && !doc.bagImage) {
    await req.payload.delete({
      req,
      collection: 'milk-bag-images',
      id: extractID(previousDoc.bagImage),
      depth: 0,
    });
  }

  return doc;
};

export const checkExpiry: CollectionBeforeReadHook<MilkBag> = async ({ doc, req }) => {
  if (req.context.milkBagStatus === MILK_BAG_STATUS.EXPIRED.value) {
    // If the status has already been set to 'EXPIRED' in this request context, skip further checks
    return doc;
  }

  if (!doc.expiresAt) {
    // If there's no expiry date, nothing to check
    return doc;
  }

  const currentDate = new Date();
  const expiryDate = new Date(doc.expiresAt);

  if (expiryDate < currentDate) {
    // At this point, we know the milk bag has expired

    switch (doc.status) {
      case MILK_BAG_STATUS.CONSUMED.value:
      case MILK_BAG_STATUS.EXPIRED.value:
      case MILK_BAG_STATUS.DISCARDED.value:
        // If already consumed, expired, or discarded, do nothing
        return doc;

      case MILK_BAG_STATUS.DRAFT.value:
      case MILK_BAG_STATUS.AVAILABLE.value:
      case MILK_BAG_STATUS.ALLOCATED.value:
      default:
        // For all other statuses, we will proceed to update the status to 'EXPIRED'
        break;
    }

    // Set a flag in the request context to avoid redundant updates
    req.context.milkBagStatus = MILK_BAG_STATUS.EXPIRED.value;

    // Update the status to 'EXPIRED' if the expiry date has passed
    await req.payload.update({
      collection: 'milkBags',
      id: doc.id,
      data: { status: MILK_BAG_STATUS.EXPIRED.value },
      req,
    });

    // Reflect the change in the current read operation
    doc.status = MILK_BAG_STATUS.EXPIRED.value;
  }

  return doc;
};
