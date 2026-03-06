import { clearReadRecords } from '@/lib/utils/donationOrRequest/clearReadRecords';
import { hookLogger } from '@lactalink/agents/payload';
import { Donation } from '@lactalink/types/payload-generated-types';
import { CollectionAfterChangeHook } from 'payload';

export const afterChange: CollectionAfterChangeHook<Donation> = async ({
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
