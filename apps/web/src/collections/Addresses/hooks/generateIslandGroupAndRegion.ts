import { Address } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { CollectionBeforeChangeHook } from 'payload';

export const generateIslandGroupAndRegion: CollectionBeforeChangeHook<Address> = async ({
  data,
  req,
}) => {
  if (!data?.province) return data;

  const payload = req.payload;
  const provinceID = extractID(data.province);

  if (provinceID) {
    const { region, islandGroup } = await payload.findByID({
      collection: 'provinces',
      id: provinceID,
      depth: 0,
      select: { region: true, islandGroup: true },
      req,
    });
    data.region = extractID(region);
    data.islandGroup = extractID(islandGroup);
  }

  return data;
};
