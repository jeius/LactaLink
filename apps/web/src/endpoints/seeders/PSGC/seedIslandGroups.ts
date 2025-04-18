import { PSGC_API_URL } from '@/lib/constants';
import { IslandGroup, IslandGroupPSGC } from '@lactalink/types';
import { batchProcess } from '@lactalink/utilities';
import status from 'http-status';
import { APIError, PayloadRequest } from 'payload';

const API_URL = `${PSGC_API_URL}/api/island-groups.json`;
const headers = new Headers({
  'Content-Type': 'application/json',
});

export async function seedIslandGroups(req: PayloadRequest): Promise<IslandGroup[]> {
  const { payload, user } = req;

  const response = await fetch(API_URL, { method: 'GET', headers });

  if (!response.ok) {
    throw new APIError('Unable to fetch island groups from PSGC.', status.EXPECTATION_FAILED);
  }

  const data = (await response.json()) as IslandGroupPSGC[];

  return await batchProcess(
    data,
    8,
    async (data) => await payload.create({ collection: 'islandGroups', data, user, req })
  );
}
