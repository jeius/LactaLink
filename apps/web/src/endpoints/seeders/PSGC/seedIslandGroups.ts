import { PSGC_API_URL } from '@/lib/constants';
import { IslandGroup, IslandGroupPSGC } from '@lactalink/types';
import { batchProcess } from '@lactalink/utilities';
import { status } from 'http-status';
import { APIError, PayloadRequest } from 'payload';

const API_URL = `${PSGC_API_URL}/api/island-groups.json`;
const headers = new Headers({
  'Content-Type': 'application/json',
});

const collection = 'islandGroups';

export async function seedIslandGroups(req: PayloadRequest): Promise<IslandGroup[]> {
  const { payload, user } = req;

  const response = await fetch(API_URL, { method: 'GET', headers });

  if (!response.ok) {
    throw new APIError('Unable to fetch island groups from PSGC.', status.EXPECTATION_FAILED);
  }

  const data = (await response.json()) as IslandGroupPSGC[];

  const islandGroups = await batchProcess(data, 10, async (data) => {
    const existingDoc = await payload.find({
      req,
      user,
      collection,
      pagination: false,
      limit: 1,
      where: { code: { equals: data.code } },
    });

    if (existingDoc.totalDocs > 0) {
      return existingDoc.docs[0];
    }

    return await payload.create({ collection, data, user, req });
  });

  return islandGroups.filter((item) => item !== null);
}
