import { PSGC_API_URL } from '@/lib/constants';
import type { IslandGroup, Region, RegionPSGC } from '@lactalink/types';
import { batchProcess } from '@lactalink/utilities';
import { status } from 'http-status';
import { APIError, PayloadRequest } from 'payload';

const API_URL = `${PSGC_API_URL}/api/regions.json`;
const headers = new Headers({
  'Content-Type': 'application/json',
});

const collection = 'regions';
type IncomingData = {
  islandGroups: IslandGroup[];
};

export async function seedRegions(
  req: PayloadRequest,
  incomingData: IncomingData
): Promise<Region[]> {
  const { payload, user } = req;

  const { islandGroups } = incomingData;

  const response = await fetch(API_URL, { method: 'GET', headers });

  if (!response.ok) {
    throw new APIError('Unable to fetch regions from PSGC.', status.EXPECTATION_FAILED);
  }

  const data = (await response.json()) as RegionPSGC[];

  const regions = await batchProcess(data, 100, async (data) => {
    const { name, code, regionName, islandGroupCode } = data;

    const existingDoc = await payload.find({
      req,
      user,
      collection,
      pagination: false,
      limit: 1,
      select: { id: true, code: true },
      where: { code: { equals: code } },
    });

    if (existingDoc.totalDocs > 0) {
      return existingDoc.docs[0];
    }

    const islandGroupID = islandGroups.find((item) => item.code === islandGroupCode)?.id;

    if (!islandGroupID) {
      throw new APIError(`Island Group ID not found for region: ${name}`, status.NOT_FOUND);
    }

    return await payload.create({
      collection,
      user,
      req,
      select: { id: true, code: true },
      data: {
        name,
        code,
        regionName,
        islandGroup: islandGroupID,
      },
    });
  });

  return regions.filter((item) => item !== null);
}
