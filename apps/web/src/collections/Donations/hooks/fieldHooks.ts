import { Donation } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import isEqual from 'lodash/isEqual';
import { FieldHook } from 'payload';

export const generateTitle: FieldHook<Donation, Donation['title']> = async ({
  data,
  req,
  value,
  originalDoc,
  operation,
}) => {
  const defaultTitle = 'Untitled Donation';

  const generateTitle = async () => {
    const id = extractID(data?.donor);

    if (!id || !data?.volume) return defaultTitle;

    const doc = await req.payload.findByID({
      req,
      collection: 'individuals',
      id,
      depth: 0,
      select: { displayName: true, familyName: true, givenName: true },
    });

    const name = doc.displayName || `${doc.givenName || ''} ${doc.familyName || ''}`.trim();

    return `${name} | ${data.volume} mL`;
  };

  // Generate on create
  if (operation === 'create') {
    return await generateTitle();
  } else if (operation === 'update') {
    // On update, only regenerate if donor or volume has changed
    if (!isEqual(data?.donor, originalDoc?.donor) || !isEqual(data?.volume, originalDoc?.volume)) {
      return await generateTitle();
    }
    return value || defaultTitle;
  } else {
    // For other operations, keep existing title
    return value || defaultTitle;
  }
};
