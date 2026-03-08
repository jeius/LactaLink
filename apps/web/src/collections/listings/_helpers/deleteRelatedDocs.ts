import { hookLogger } from '@lactalink/agents/payload';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { PayloadRequest, SanitizedCollectionConfig } from 'payload';
import { clearReadRecords } from './clearReadRecords';

/**
 * Deletes documents related to a donation, such as milk bags, images, and read tracking records.
 *
 * @param doc - The `Donation` document for which related documents should be deleted.
 * @param req - The `PayloadRequest` object, used to perform delete operations on related collections.
 * @param collection - The collection configuration for the donation or request, used to determine which related collections to target.
 * @param logger - Optional logger for structured logging within the function.
 * @return A promise that resolves once all delete operations are complete. The promise will
 * reject if any of the underlying Payload operations fail.
 */
export async function deleteRelatedDocsForDonation(
  doc: Donation,
  req: PayloadRequest,
  collection: SanitizedCollectionConfig,
  logger?: ReturnType<typeof hookLogger>
) {
  const logInfo = (msg: string | null | undefined) => logger?.info(msg || '');

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
        .catch((error) => logger?.error(error, 'Error deleting milk bags related to donation'))
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
        .catch((error) => logger?.error(error, 'Error deleting images related to donation'))
        .then(() => logInfo(`Deleted ${images.length} images related to donation ${doc.id}`));
    }
  };

  await Promise.all([
    deleteMilkBags(),
    deleteImages(),
    clearReadRecords(doc, req, collection, logger),
  ]);
}

/**
 * Deletes documents related to a request, such as images, and clears read tracking records.
 *
 * @param doc - The `Request` document
 * @param req - The `PayloadRequest` object, used to perform delete operations on related collections
 * @param collection - The collection configuration for the request
 * @param logger - Optional logger for structured logging within the function
 *
 * @returns A promise that resolves once all delete operations are complete. The promise
 * will reject if any of the underlying Payload operations fail.
 */
export async function deleteRelatedDocsForRequest(
  doc: Request,
  req: PayloadRequest,
  collection: SanitizedCollectionConfig,
  logger?: ReturnType<typeof hookLogger>
) {
  const logInfo = (msg: string | null | undefined) => logger?.info(msg || '');

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
        .catch((error) => logger?.error(error, 'Error deleting image related to request'))
        .then(() => logInfo(`Deleted an image related to request ${doc.id}`));
    }
  };

  await Promise.all([deleteImages(), clearReadRecords(doc, req, collection, logger)]);
}
