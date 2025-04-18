import { PSGC_API_URL } from '@/lib/constants';
import type {
  CityMunicipality,
  CityMunicipalityPSGC,
  IslandGroup,
  Province,
  Region,
} from '@lactalink/types';
import { batchProcess } from '@lactalink/utilities';
import status from 'http-status';
import { APIError, PayloadRequest } from 'payload';

const API_URL = `${PSGC_API_URL}/api/cities-municipalities.json`;
const headers = new Headers({
  'Content-Type': 'application/json',
});

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
  const { islandGroups, regions, provinces } = incomingData;

  const response = await fetch(API_URL, { method: 'GET', headers });

  if (!response.ok) {
    throw new APIError(
      'Unable to fetch cities/municipalities from PSGC.',
      status.EXPECTATION_FAILED
    );
  }

  const resData = (await response.json()) as CityMunicipalityPSGC[];

  const citiesMunicipalities = await batchProcess(resData, 10, async (data) => {
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

    const islandGroupID = islandGroups.find((item) => item.code === islandGroupCode)?.id;
    const regionID = regions.find((item) => item.code === regionCode)?.id;
    const provinceID = provinces.find((item) => item.code === provinceCode)?.id;

    if (!islandGroupID) {
      throw new APIError(
        `Island Group ID not found for city/municipality: ${name}`,
        status.NOT_FOUND
      );
    }

    if (!regionID) {
      throw new APIError(`Region ID not found for city/municipality: ${name}`, status.NOT_FOUND);
    }

    if (!provinceID) {
      throw new APIError(`Province ID not found for city/municipality: ${name}`, status.NOT_FOUND);
    }

    return await payload.create({
      collection: 'citiesMunicipalities',
      user,
      req,
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

  return citiesMunicipalities;
}
