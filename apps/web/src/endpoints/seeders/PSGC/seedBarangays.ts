import { PSGC_API_URL } from '@/lib/constants';
import type {
  Barangay,
  BarangayPSGC,
  CityMunicipality,
  IslandGroup,
  Province,
  Region,
} from '@lactalink/types';
import { batchProcess } from '@lactalink/utilities';
import status from 'http-status';
import { APIError, PayloadRequest } from 'payload';

const API_URL = `${PSGC_API_URL}/api/barangays.json`;
const headers = new Headers({
  'Content-Type': 'application/json',
});

type IncomingData = {
  islandGroups: IslandGroup[];
  regions: Region[];
  provinces: Province[];
  citiesMunicipalities: CityMunicipality[];
};

export async function seedBarangays(
  req: PayloadRequest,
  incomingData: IncomingData
): Promise<Barangay[]> {
  const { payload, user } = req;
  const { islandGroups, regions, provinces, citiesMunicipalities } = incomingData;

  const response = await fetch(API_URL, { method: 'GET', headers });

  if (!response.ok) {
    throw new APIError('Unable to fetch barangays from PSGC.', status.EXPECTATION_FAILED);
  }

  const resData = (await response.json()) as BarangayPSGC[];

  return await batchProcess(resData, 10, async (data) => {
    const {
      name,
      code,
      regionCode,
      islandGroupCode,
      cityCode,
      municipalityCode,
      oldName,
      provinceCode,
      districtCode,
      subMunicipalityCode,
    } = data;

    const islandGroupID = islandGroups.find((item) => item.code === islandGroupCode)?.id;
    const regionID = regions.find((item) => item.code === regionCode)?.id;
    const provinceID = provinces.find((item) => item.code === provinceCode)?.id;

    let cityMunicipalityID: string | undefined;

    if (typeof cityCode === 'string') {
      cityMunicipalityID = citiesMunicipalities.find((item) => item.code === cityCode)?.id;
    }

    if (typeof municipalityCode === 'string') {
      cityMunicipalityID = citiesMunicipalities.find((item) => item.code === municipalityCode)?.id;
    }

    if (!islandGroupID) {
      throw new APIError(`Island Group ID not found for barangay: ${name}`, status.NOT_FOUND);
    }

    if (!regionID) {
      throw new APIError(`Region ID not found for barangay: ${name}`, status.NOT_FOUND);
    }

    if (!provinceID) {
      throw new APIError(`Province ID not found for barangay: ${name}`, status.NOT_FOUND);
    }

    if (!cityMunicipalityID) {
      throw new APIError(`City/Municipality ID not found for barangay: ${name}`, status.NOT_FOUND);
    }

    return await payload.create({
      collection: 'barangays',
      user,
      req,
      data: {
        name,
        code,
        oldName,
        cityMunicipality: cityMunicipalityID,
        districtCode: typeof districtCode === 'string' ? districtCode : null,
        subMunicipalityCode: typeof subMunicipalityCode === 'string' ? subMunicipalityCode : null,
        province: provinceID,
        region: regionID,
        islandGroup: islandGroupID,
      },
    });
  });
}
