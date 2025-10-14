import { ID_STATUS } from '@lactalink/enums/identities';
import { Identity } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionAfterChangeHook } from 'payload';

export const onStatusChanged: CollectionAfterChangeHook<Identity> = async ({
  req,
  operation,
  doc,
}) => {
  const approvedStatus = ID_STATUS.APPROVED.value;

  if (operation !== 'update') return doc;

  await req.payload.update({
    collection: 'individuals',
    id: extractID(doc.submittedBy),
    data: { isVerified: doc.status === approvedStatus },
    req,
    depth: 0,
  });

  return doc;
};

export const onImageChanged: CollectionAfterChangeHook<Identity> = async ({
  req,
  operation,
  doc,
  previousDoc,
}) => {
  if (operation !== 'update') return doc;

  const prevIDImage = extractID(previousDoc.idImage);
  const newIDImage = extractID(doc.idImage);
  const prevRefImage = extractID(previousDoc.refImage);
  const newRefImage = extractID(doc.refImage);

  const deleteIfChanged = async (oldImage: string, newImage: string) => {
    if (oldImage !== newImage) {
      await req.payload.delete({
        collection: 'identity-images',
        id: oldImage,
        req,
        depth: 0,
        overrideAccess: true,
      });
      return true;
    }
    return false;
  };

  const result = await Promise.all([
    deleteIfChanged(prevIDImage, newIDImage),
    deleteIfChanged(prevRefImage, newRefImage),
  ]).catch((err) => {
    req.payload.logger.error(
      {
        error: err,
      },
      'Failed to delete old identity image(s).'
    );
    return [false, false] as const;
  });

  req.payload.logger.info(
    {
      idImageDeleted: result[0],
      refImageDeleted: result[1],
    },
    'Old identity image(s) deleted if they were changed.'
  );

  return doc;
};
