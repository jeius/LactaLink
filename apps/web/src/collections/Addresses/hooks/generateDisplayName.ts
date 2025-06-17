import { Address } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
import { sanitizeStreetAddress } from '@lactalink/utilities/formatters';
import { CollectionBeforeChangeHook } from 'payload';

export const generateDisplayName: CollectionBeforeChangeHook<Address> = async ({ req, data }) => {
  const { payload } = req;

  const street = data.street && sanitizeStreetAddress(data.street);

  const locationFields = [
    { key: 'barangay', collection: 'barangays' },
    { key: 'cityMunicipality', collection: 'citiesMunicipalities' },
    { key: 'province', collection: 'provinces' },
  ] as const;

  const resolvedLocations = await Promise.all(
    locationFields.map(async ({ key, collection }) => {
      const id = data[key] && extractID(data[key]);
      if (id) {
        const record = await payload.findByID({ collection, id, depth: 0, select: { name: true } });
        return record.name;
      } else return id;
    })
  );

  data.street = street;
  data.displayName = [street, ...resolvedLocations].filter(Boolean).join(', ');

  return data;
};
