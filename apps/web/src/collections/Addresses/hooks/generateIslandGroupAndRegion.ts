import { Address } from '@lactalink/types';
import { extractID } from '@lactalink/utilities';
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
    });
    data.region = region;
    data.islandGroup = islandGroup;
  }

  return data;
};
