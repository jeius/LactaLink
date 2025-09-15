import { Address } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionAfterChangeHook } from 'payload';

export const ensureUniqueDefaultAddress: CollectionAfterChangeHook<Address> = async ({
  doc,
  req,
}) => {
  // Only run if this address is set as default
  if (!doc.isDefault || !doc.owner) return doc;

  // Update all other addresses for this owner to not be default
  await req.payload.update({
    collection: 'addresses',
    where: {
      and: [{ owner: { equals: extractID(doc.owner) } }, { isDefault: { equals: true } }],
    },
    data: {
      isDefault: false,
    },
  });

  return doc;
};
