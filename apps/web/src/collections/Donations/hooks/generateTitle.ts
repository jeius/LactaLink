import { Donation } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { CollectionBeforeChangeHook } from 'payload';

export const generateTitle: CollectionBeforeChangeHook<Donation> = async ({ data, req }) => {
  if (!data.donor || !data.milkDetails?.amount) return data;

  const donorId = extractID(data.donor);

  const donorDoc = await req.payload.findByID({
    collection: 'individuals',
    id: donorId,
    depth: 0,
    select: { displayName: true, familyName: true, givenName: true },
  });

  const name =
    donorDoc.displayName || `${donorDoc.givenName || ''} ${donorDoc.familyName || ''}`.trim();

  data.title = `${name} | ${data.milkDetails.amount} mL`;

  return data;
};
