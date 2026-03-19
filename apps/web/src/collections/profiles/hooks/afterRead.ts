import { cacheStore, hookLogger, isHookRun, markHookRun } from '@lactalink/agents/payload';
import {
  Address,
  Hospital,
  Individual,
  MilkBank,
  User,
} from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionAfterReadHook } from 'payload';
import { getDefaultAddress } from '../helpers/getDefaultAddress';
import { getOwner } from '../helpers/getOwner';

export const afterRead: CollectionAfterReadHook<Hospital | Individual | MilkBank> = async ({
  req,
  doc,
  collection,
}) => {
  const logger = hookLogger(req, collection.slug, 'afterRead');

  const [getCachedOwner, setOwnerCache] = cacheStore<User | null>(
    req,
    `owner-${collection.slug}-${doc.id}`
  );
  const [getCachedAddress, setAddressCache] = cacheStore<Address | null>(
    req,
    `defaultAddress-${collection.slug}-${doc.id}`
  );

  const contextID = `afterRead-${collection.slug}-${doc.id}`;
  if (isHookRun(req, contextID)) {
    doc.owner = getCachedOwner();
    doc.defaultAddress = getCachedAddress();
    return doc;
  }
  markHookRun(req, contextID);

  const owner = await getOwner(doc.id, collection.slug, req, logger);
  const defaultAddress = owner ? await getDefaultAddress(extractID(owner), req) : null;

  // Attach the virtual fields to the document before it is sent in the response.
  doc.owner = owner;
  doc.defaultAddress = defaultAddress;

  // Cache the results
  setOwnerCache(owner);
  setAddressCache(defaultAddress);

  return doc;
};
