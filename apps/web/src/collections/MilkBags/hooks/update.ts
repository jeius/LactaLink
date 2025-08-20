import { MILK_BAG_STATUS } from '@lactalink/enums';
import { MilkBag } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { CollectionAfterChangeHook, CollectionBeforeChangeHook } from 'payload';

const draftStatus = MILK_BAG_STATUS.DRAFT.value;
const availableStatus = MILK_BAG_STATUS.AVAILABLE.value;

export const updateStatus: CollectionBeforeChangeHook<MilkBag> = async ({
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
