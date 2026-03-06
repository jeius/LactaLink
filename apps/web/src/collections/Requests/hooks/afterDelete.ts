import { deleteRelatedDocsForRequest } from '@/lib/utils/donationOrRequest';
import { hookLogger } from '@lactalink/agents/payload';
import { Request } from '@lactalink/types/payload-generated-types';
import { CollectionAfterDeleteHook } from 'payload';

/**
 * After delete hook for the `Requests` collection.
 *
 * @description
 * This hook deletes related documents such as images and read tracking records when a request is deleted.
 */
export const afterDelete: CollectionAfterDeleteHook<Request> = async ({ req, doc, collection }) => {
  const logger = hookLogger(req, collection.slug, 'afterDelete');
  const logInfo = (msg: string | null | undefined) => logger.info(msg || '');

  logInfo(`Starting hook for ${collection.slug} with ID: ${doc.id}`);

  await deleteRelatedDocsForRequest(doc, req, collection, logger);

  logInfo(`Completed hook for ${collection.slug} with ID: ${doc.id}`);
};
