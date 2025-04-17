import { PSGC_API_URL } from '@/lib/constants';
import type { IslandGroup, Region, RegionPSGC } from '@lactalink/types';
import { batchProcess } from '@lactalink/utilities';
import status from 'http-status';
import { APIError, PayloadRequest } from 'payload';

const API_URL = `${PSGC_API_URL}/api/regions.json`;
const headers = new Headers({
  'Content-Type': 'application/json',
});

export async function seedRegions(
  req: PayloadRequest,
  islandGroups: IslandGroup[]
): Promise<Region[]> {
  const { payload, user } = req;

  const response = await fetch(API_URL, { headers });

  if (!response.ok) {
    throw new APIError('Unable to fetch regions.', status.EXPECTATION_FAILED);
  }

  const data = (await response.json()) as RegionPSGC[];

  const regions = await batchProcess(data, 8, async (data) => {
    const { name, code, regionName, islandGroupCode } = data;

    const islandGroupID = islandGroups.find((item) => item.code === islandGroupCode)?.id;

    if (!islandGroupID) {
      throw new APIError(`Island Group ID not found for region: ${name}`, status.NOT_FOUND);
    }

    return await payload.create({
      collection: 'regions',
      user,
      req,
      data: {
        name,
        code,
        regionName,
        islandGroup: islandGroupID,
      },
    });
  });

  return regions;
}
