import { BATCH_INDEX_KEY } from '@/lib/constants';
import { createPayloadHandler } from '@/lib/utils/createPayloadHandler';
import type { BarangayPSGC, ExistingDocs, IncomingData } from '@lactalink/types';
import { formatCamelCaseCaps } from '@lactalink/utilities/formatters';
import { status as HttpStatus } from 'http-status';
import { APIError, PayloadRequest } from 'payload';
import { getExistingOrThrow } from './utils/getExistingOrThrow';
import { seed } from './utils/seeder';

const collection = 'barangays';

export async function seedHandler(req: PayloadRequest): Promise<ExistingDocs> {
  const { payload, user, t, json } = req;

  const { data, existingData }: IncomingData<'barangays'> = json ? await json() : {};

  const {
    islandGroups: existingIslandGroups,
    provinces: existingProvinces,
    regions: existingRegions,
    citiesMunicipalities: existingCitiesMunicipalities,
  } = existingData;

  if (
    !data ||
    !existingIslandGroups ||
    !existingRegions ||
    !existingProvinces ||
    !existingCitiesMunicipalities
  ) {
    throw new APIError(t('error:missingRequiredData'), HttpStatus.NOT_FOUND);
  }

  const { rawData, existingDocs } = data;
  const collectionLabel = payload.collections[collection].config.labels.singular as string;

  return await seed({
    collection,
    payload,
    user,
    rawData,
    existingDocs,
    resolveData: (item) => {
      const islandGroupID = getExistingOrThrow(
        existingIslandGroups,
        item.islandGroupCode,
        'Island Group ID',
        collectionLabel
      );

      const regionID = getExistingOrThrow(
        existingRegions,
        item.regionCode,
        'Region ID',
        collectionLabel
      );

      const provinceID = getExistingOrThrow(
        existingProvinces,
        item.provinceCode,
        'Province ID',
        collectionLabel
      );

      const cityMuncipalityCode = item.cityCode || item.municipalityCode;

      const cityMuncipalityID = getExistingOrThrow<BarangayPSGC | false>(
        existingCitiesMunicipalities,
        cityMuncipalityCode,
        'City/Municipality ID',
        collectionLabel
      );

      const districtCode = typeof item.districtCode === 'string' ? item.districtCode : undefined;
      const subMunicipalityCode =
        typeof item.subMunicipalityCode === 'string' ? item.subMunicipalityCode : undefined;

      return {
        name: item.name,
        code: item.code,
        oldName: item.oldName,
        districtCode,
        subMunicipalityCode,
        cityMunicipality: cityMuncipalityID,
        province: provinceID,
        region: regionID,
        islandGroup: islandGroupID,
      };
    },
  });
}

export const seedBarangaysHandler = createPayloadHandler({
  requireAdmin: true,
  handler: async (req) => seedHandler(req),
  successMessage: (req) => {
    const batchIndex = Number(req.searchParams.get(BATCH_INDEX_KEY) || 0);
    return `${formatCamelCaseCaps(collection)} batch ${batchIndex} seeded successfully.`;
  },
});
