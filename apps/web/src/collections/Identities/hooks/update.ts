import { ID_STATUS } from '@lactalink/enums/identities';
import { Identity } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { CollectionAfterChangeHook } from 'payload';

export const updateOwnerOnApprove: CollectionAfterChangeHook<Identity> = async ({
  req,
  operation,
  doc,
}) => {
  const approvedStatus = ID_STATUS.APPROVED.value;

  if (operation !== 'update' || !doc.owner || doc.status !== approvedStatus) return doc;

  const ownerDoc =
    extractCollection(doc.owner) ||
    (await req.payload.findByID({
      id: extractID(doc.owner),
      collection: 'users',
      select: { profile: true },
      req,
      depth: 0,
    }));

  if (!ownerDoc?.profile) return doc;

  await req.payload.update({
    collection: ownerDoc.profile.relationTo,
    id: extractID(ownerDoc.profile.value),
    data: { isVerified: true },
    req,
    depth: 0,
  });

  return doc;
};
