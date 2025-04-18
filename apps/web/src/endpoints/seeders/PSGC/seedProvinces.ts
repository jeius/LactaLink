import { PSGC_API_URL } from '@/lib/constants';
import type { IslandGroup, Province, ProvincePSGC, Region } from '@lactalink/types';
import { batchProcess } from '@lactalink/utilities';
import status from 'http-status';
import { APIError, PayloadRequest } from 'payload';

const API_URL = `${PSGC_API_URL}/api/provinces.json`;
const headers = new Headers({
  'Content-Type': 'application/json',
});

type IncomingData = {
  islandGroups: IslandGroup[];
  regions: Region[];
};

export async function seedProvinces(
  req: PayloadRequest,
  incomingData: IncomingData
): Promise<Province[]> {
  const { payload, user } = req;
  const { islandGroups, regions } = incomingData;

  const response = await fetch(API_URL, { method: 'GET', headers });

  if (!response.ok) {
    throw new APIError('Unable to fetch provinces from PSGC.', status.EXPECTATION_FAILED);
  }

  const resData = (await response.json()) as ProvincePSGC[];

  return await batchProcess(resData, 10, async (data) => {
    const { name, code, regionCode, islandGroupCode } = data;

    const islandGroupID = islandGroups.find((item) => item.code === islandGroupCode)?.id;
    const regionID = regions.find((item) => item.code === regionCode)?.id;

    if (!islandGroupID) {
      throw new APIError(`Island Group ID not found for province: ${name}`, status.NOT_FOUND);
    }

    if (!regionID) {
      throw new APIError(`Region ID not found for province: ${name}`, status.NOT_FOUND);
    }

    return await payload.create({
      collection: 'provinces',
      user,
      req,
      data: {
        name,
        code,
        region: regionID,
        islandGroup: islandGroupID,
      },
    });
  });
}
