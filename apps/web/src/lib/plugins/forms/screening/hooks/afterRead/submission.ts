import { DonorScreeningSubmission } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { CollectionAfterReadHook } from 'payload';

export const afterReadSubmission: CollectionAfterReadHook<DonorScreeningSubmission> = async ({
  doc,
  req,
}) => {
  if (!doc.submittedBy) return doc;

  const user = await req.payload.findByID({
    req,
    collection: 'users',
    id: extractID(doc.submittedBy),
    depth: 1,
    select: { profile: true },
    populate: {
      individuals: { displayName: true },
      hospitals: { displayName: true },
      milkBanks: { displayName: true },
    },
  });

  const profile = extractCollection(user.profile?.value);

  if (!profile) return doc;
  return { ...doc, submitterName: profile.displayName };
};
