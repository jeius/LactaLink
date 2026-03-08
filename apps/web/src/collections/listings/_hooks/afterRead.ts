import { hookLogger } from '@lactalink/agents/payload';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { CollectionAfterReadHook } from 'payload';

export const afterRead: CollectionAfterReadHook<Donation | Request> = async ({
  doc,
  req,
  collection,
}) => {
  const _logger = hookLogger(req, collection.slug, 'afterRead');
  return doc;
};
