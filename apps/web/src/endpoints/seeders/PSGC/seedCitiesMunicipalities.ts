import { PSGC_API_URL } from '@/lib/constants';
import type {
  CityMunicipality,
  CityMunicipalityPSGC,
  IslandGroup,
  Province,
  Region,
} from '@lactalink/types';
import { batchProcess } from '@lactalink/utilities';
import { status } from 'http-status';
import { APIError, PayloadRequest } from 'payload';

const API_URL = `${PSGC_API_URL}/api/cities-municipalities.json`;
const headers = new Headers({
  'Content-Type': 'application/json',
});
const collection = 'citiesMunicipalities';

type IncomingData = {
  islandGroups: IslandGroup[];
  regions: Region[];
  provinces: Province[];
};

export async function seedCitiesMunicipalities(
  req: PayloadRequest,
  incomingData: IncomingData
): Promise<CityMunicipality[]> {
  const { payload, user } = req;

  const { islandGroups, provinces, regions } = incomingData;

  const response = await fetch(API_URL, { method: 'GET', headers });

  if (!response.ok) {
    throw new APIError(
      'Unable to fetch cities/municipalities from PSGC.',
      status.EXPECTATION_FAILED
    );
  }

  const resData = (await response.json()) as CityMunicipalityPSGC[];

  const citiesMunicipalities = await batchProcess(resData, 5000, async (data) => {
    const {
      name,
      code,
      regionCode,
      islandGroupCode,
      isCapital,
      oldName,
      provinceCode,
      isCity,
      isMunicipality,
      districtCode,
    } = data;

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
    const regionID = regions.find((item) => item.code === regionCode)?.id;
    const provinceID = provinces.find((item) => item.code === provinceCode)?.id;

    if (!islandGroupID) {
      payload.logger.error(data, `Island Group ID not found for city/municipality: ${name}`);
      payload.logger.error(`Skipping creation of city/municipality: ${name}`);
      return null;
    }

    if (!regionID) {
      payload.logger.error(data, `Region ID not found for city/municipality: ${name}`);
      payload.logger.error(`Skipping creation of city/municipality: ${name}`);
      return null;
    }

    return await payload.create({
      collection,
      user,
      req,
      select: { id: true, code: true },
      data: {
        name,
        code,
        oldName,
        isCapital,
        type: isCity ? 'city' : isMunicipality ? 'municipality' : 'none',
        districtCode: typeof districtCode === 'string' ? districtCode : null,
        province: provinceID,
        region: regionID,
        islandGroup: islandGroupID,
      },
    });
  });

  return citiesMunicipalities.filter((item) => item !== null);
}
