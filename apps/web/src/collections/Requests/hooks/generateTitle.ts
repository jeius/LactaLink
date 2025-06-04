import { Request } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { CollectionBeforeChangeHook } from 'payload';

export const generateTitle: CollectionBeforeChangeHook<Request> = async ({ data, req }) => {
  if (!data.requester || !data.volumeNeeded) return data;

  const id = extractID(data.requester);

  const doc = await req.payload.findByID({
    collection: 'individuals',
    id,
    depth: 0,
    select: { displayName: true, familyName: true, givenName: true },
  });

  const name = doc.displayName || `${doc.givenName || ''} ${doc.familyName || ''}`.trim();

  data.title = `${name} | ${data.volumeNeeded} mL`;

  return data;
};
