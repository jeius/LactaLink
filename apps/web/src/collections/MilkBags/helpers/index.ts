import { MILK_BAG_OWNERSHIP_TRANSFER_REASONS, MILK_BAG_STATUS } from '@lactalink/enums/milkbags';
import { MilkBag } from '@lactalink/types/payload-generated-types';
import { isEqualProfiles } from '@lactalink/utilities/checkers';
import { extractID } from '@lactalink/utilities/extractors';
import { PayloadRequest } from 'payload';

/**
 * After a milk bag is updated, if the bagImage was removed, delete the associated image file
 * from the 'milk-bag-images' collection to prevent orphaned media and save storage space.
 */
export async function deleteRemovedImage(
  doc: MilkBag,
  previousDoc: MilkBag | null,
  req: PayloadRequest
) {
  // If the bagImage was removed, delete the image file
  if (previousDoc?.bagImage && doc.bagImage === null) {
    await req.payload.delete({
      req,
      collection: 'milk-bag-images',
      id: extractID(previousDoc.bagImage),
      depth: 0,
    });
  }
}

/**
 * When a milk bag changes ownership, this creates a new record in the Ownership History
 */
export async function createOwnershipHistoryRecord(
  doc: MilkBag,
  previousDoc: MilkBag | null,
  req: PayloadRequest
) {
  if (!previousDoc) return doc;

  // If ownership is being updated, create a new ownership history record
  if (doc.owner && !isEqualProfiles(previousDoc.owner, doc.owner)) {
    await req.payload.create({
      req,
      collection: 'milkbag-ownership-histories',
      data: {
        milkBag: extractID(doc),
        previousOwner: previousDoc.owner,
        newOwner: doc.owner,
        transferReason: MILK_BAG_OWNERSHIP_TRANSFER_REASONS.DONATION_COMPLETED.value,
        transferredAt: new Date().toISOString(),
      },
    });
  }

  return doc;
}

/**
 * When a milk bag's status or bagImage is updated, ensure the status and bagImage fields remain in sync:
 *  - If a bagImage is added to a DRAFT bag, change status to AVAILABLE
 *  - If status is changed to DRAFT, remove bagImage
 */
export function updateMilkStatus(data: Partial<MilkBag>, originalDoc: MilkBag | undefined) {
  const draftStatus = MILK_BAG_STATUS.DRAFT.value;
  const availableStatus = MILK_BAG_STATUS.AVAILABLE.value;

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
}
