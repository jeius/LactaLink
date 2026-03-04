import { hookLogger } from '@lactalink/agents/payload';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionAfterDeleteHook, CollectionSlug, PayloadRequest } from 'payload';

export const afterDeleteDonationOrRequest: CollectionAfterDeleteHook<Donation | Request> = async ({
  req,
  doc,
  collection,
}) => {
  const logger = hookLogger(req, collection.slug, 'afterDelete');
  const logInfo = (msg: string | null | undefined) => logger.info(msg || '');

  logInfo(`Starting afterDelete hook for ${collection.slug} with ID: ${doc.id}`);

  if (collection.slug === 'donations') {
    await deleteRelatedDocsForDonation(req, doc as Donation, logger);
  } else if (collection.slug === 'requests') {
    await deleteRelatedDocsForRequest(req, doc as Request, logger);
  }

  logInfo(`Completed afterDelete hook for ${collection.slug} with ID: ${doc.id}`);
};

//#region Helper functions ------------------------------------------------------

/**
 * Helper function to delete read tracking records for a given donation or request.
 */
async function deleteReadRecords(req: PayloadRequest, docID: string, slug: CollectionSlug) {
  // Delete read tracking records
  const readCollection = slug === 'donations' ? 'donation-reads' : 'request-reads';
  const entityField = slug === 'donations' ? 'donation' : 'request';

  const { docs } = await req.payload.delete({
    collection: readCollection,
    where: { [entityField]: { equals: docID } },
    depth: 0,
    req,
  });

  return `Deleted ${docs.length || 0} read records from ${readCollection} for ${docID}`;
}

/**
 * Helper function to delete related documents for a donation, such as milk bags and images.
 */
async function deleteRelatedDocsForDonation(
  req: PayloadRequest,
  doc: Donation,
  logger: ReturnType<typeof hookLogger>
) {
  const logInfo = (msg: string | null | undefined) => logger.info(msg || '');

  const baseOptions = { depth: 0, req };

  const deleteMilkBags = async () => {
    const milkBagIDs = extractID(doc.details.bags || []);

    if (milkBagIDs.length) {
      await req.payload
        .delete({
          collection: 'milkBags',
          where: { id: { in: milkBagIDs } },
          ...baseOptions,
        })
        .catch((error) => logger.error(error, 'Error deleting milk bags related to donation'))
        .then(() =>
          logInfo(`Deleted ${milkBagIDs.length} milk bags related to donation ${doc.id}`)
        );
    }
  };

  const deleteImages = async () => {
    const images = extractID(doc.details.milkSample || []);

    if (images.length) {
      await req.payload
        .delete({
          collection: 'images',
          where: { id: { in: images } },
          ...baseOptions,
        })
        .catch((error) => logger.error(error, 'Error deleting images related to donation'))
        .then(() => logInfo(`Deleted ${images.length} images related to donation ${doc.id}`));
    }
  };

  await Promise.all([
    deleteMilkBags(),
    deleteImages(),
    deleteReadRecords(req, doc.id, 'donations').then(logInfo),
  ]);
}

/**
 * Helper function to delete related documents for a request
 */
async function deleteRelatedDocsForRequest(
  req: PayloadRequest,
  doc: Request,
  logger: ReturnType<typeof hookLogger>
) {
  const logInfo = (msg: string | null | undefined) => logger.info(msg || '');

  const baseOptions = { depth: 0, req };

  const deleteImages = async () => {
    const imageID = extractID(doc.details.image);

    if (imageID) {
      await req.payload
        .delete({
          collection: 'images',
          id: imageID,
          ...baseOptions,
        })
        .catch((error) => logger.error(error, 'Error deleting image related to request'))
        .then(() => logInfo(`Deleted an image related to request ${doc.id}`));
    }
  };

  await Promise.all([deleteImages(), deleteReadRecords(req, doc.id, 'requests').then(logInfo)]);
}
//#endregion
