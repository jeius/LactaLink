import { hookLogger } from '@lactalink/agents/payload';
import { Hospital, Individual, MilkBank } from '@lactalink/types/payload-generated-types';
import { CollectionAfterReadHook } from 'payload';
import { getDefaultAddress } from '../helpers/getDefaultAddress';
import { getOwner } from '../helpers/getOwner';

export const afterRead: CollectionAfterReadHook<Hospital | Individual | MilkBank> = async ({
  req,
  doc,
  collection,
}) => {
  const logger = hookLogger(req, collection.slug, 'afterRead');

  // Query the full document of the virtual fields to ensure they are populated in the response.
  const owner = await getOwner(doc.id, collection.slug, req, logger);
  const defaultAddress = owner ? await getDefaultAddress(owner.id, req) : null;

  // Attach the virtual fields to the document before it is sent in the response.
  doc.owner = owner;
  doc.defaultAddress = defaultAddress;
  return doc;
};
