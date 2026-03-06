import { deleteRelatedDocsForDonation } from '@/lib/utils/donationOrRequest';
import { hookLogger } from '@lactalink/agents/payload';
import { Donation } from '@lactalink/types/payload-generated-types';
import { CollectionAfterDeleteHook } from 'payload';

/**
 * After delete hook for the `Donations` collection.
 *
 * @description
 * This hook deletes related documents such as images and read tracking records when a donation is deleted.
 */
export const afterDelete: CollectionAfterDeleteHook<Donation> = async ({
  req,
  doc,
  collection,
}) => {
  const logger = hookLogger(req, collection.slug, 'afterDelete');
  const logInfo = (msg: string | null | undefined) => logger.info(msg || '');

  logInfo(`Starting hook for ${collection.slug} with ID: ${doc.id}`);

  await deleteRelatedDocsForDonation(doc, req, collection, logger);

  logInfo(`Completed hook for ${collection.slug} with ID: ${doc.id}`);
};
