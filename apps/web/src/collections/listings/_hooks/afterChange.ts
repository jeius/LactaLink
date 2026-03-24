import { hookLogger } from '@lactalink/agents/payload';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { isDonation } from '@lactalink/utilities/type-guards';
import { CollectionAfterChangeHook } from 'payload';
import { clearReadRecords, publishMilkbags } from '../_helpers';

export const afterChange: CollectionAfterChangeHook<Donation | Request> = async ({
  doc,
  req,
  operation,
  collection,
}) => {
  if (operation === 'create') {
    const logger = hookLogger(req, collection.slug, 'afterCreate');
    if (isDonation(doc)) {
      await publishMilkbags(req, doc, logger);
    }
  }

  if (operation === 'update') {
    const logger = hookLogger(req, collection.slug, 'afterUpdate');

    await Promise.all([clearReadRecords(doc, req, collection, logger)]);
  }

  return doc;
};
