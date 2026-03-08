import { hookLogger } from '@lactalink/agents/payload';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { CollectionAfterChangeHook } from 'payload';
import { clearReadRecords } from '../_helpers';

export const afterChange: CollectionAfterChangeHook<Donation | Request> = async ({
  doc,
  req,
  operation,
  collection,
}) => {
  if (operation === 'create') {
    // Create operations here if needed in the future...
  }

  if (operation === 'update') {
    const logger = hookLogger(req, collection.slug, 'afterUpdate');

    await Promise.all([clearReadRecords(doc, req, collection, logger)]);
  }

  return doc;
};
