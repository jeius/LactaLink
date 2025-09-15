import { Donation } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionBeforeChangeHook } from 'payload';

export const generateTitle: CollectionBeforeChangeHook<Donation> = async ({ data, req }) => {
  if (!data.donor || !data.volume) return data;

  const id = extractID(data.donor);

  const doc = await req.payload.findByID({
    req,
    collection: 'individuals',
    id,
    depth: 0,
    select: { displayName: true, familyName: true, givenName: true },
  });

  const name = doc.displayName || `${doc.givenName || ''} ${doc.familyName || ''}`.trim();

  data.title = `${name} | ${data.volume} mL`;

  return data;
};
