import { hookLogger } from '@lactalink/agents/payload';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { isDonation } from '@lactalink/utilities/type-guards';
import { CollectionAfterDeleteHook } from 'payload';
import {
  deleteRelatedDocsForDonation,
  deleteRelatedDocsForRequest,
} from '../_helpers/deleteRelatedDocs';

/**
 * After delete hook for the `Donations` and `Requests` collection.
 *
 * @description
 * This hook deletes related documents such as images and read tracking
 * records when a donation or request is deleted.
 */
export const afterDelete: CollectionAfterDeleteHook<Donation | Request> = async ({
  req,
  doc,
  collection,
}) => {
  const logger = hookLogger(req, collection.slug, 'afterDelete');
  const logInfo = (msg: string | null | undefined) => logger.info(msg || '');

  logInfo(`Starting hook for ${collection.slug} with ID: ${doc.id}`);

  if (isDonation(doc)) {
    await deleteRelatedDocsForDonation(doc, req, collection, logger);
  } else {
    await deleteRelatedDocsForRequest(doc, req, collection, logger);
  }

  logInfo(`Completed hook for ${collection.slug} with ID: ${doc.id}`);
};
