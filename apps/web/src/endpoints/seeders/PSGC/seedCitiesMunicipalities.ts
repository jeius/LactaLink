import { BATCH_INDEX_KEY } from '@/lib/constants';
import { createPayloadHandler } from '@/lib/utils/createPayloadHandler';
import type {
  CityMunicipality,
  CityMunicipalityPSGC,
  CollectionSlugPSGC,
  ExistingDocs,
  IncomingCityMunicipalityData,
} from '@lactalink/types';
import { formatCamelCaseCaps } from '@lactalink/utilities/formatString';
import { status as HttpStatus } from 'http-status';
import { APIError, PayloadRequest } from 'payload';
import { getExistingOrThrow } from './utils/getExistingOrThrow';
import { seed } from './utils/seeder';

const collection: CollectionSlugPSGC = 'citiesMunicipalities';

export async function seedHandler(req: PayloadRequest): Promise<ExistingDocs> {
  const { payload, user, t, json } = req;

  const {
    citiesMunicipalities,
    existingIslandGroups,
    existingRegions,
    existingProvinces,
  }: IncomingCityMunicipalityData = json ? await json() : {};

  if (!citiesMunicipalities || !existingIslandGroups || !existingRegions || !existingProvinces) {
    throw new APIError(t('error:missingRequiredData'), HttpStatus.NOT_FOUND);
  }

  const { rawData, existingDocs } = citiesMunicipalities;
  const collectionLabel = payload.collections[collection].config.labels.singular as string;

  return await seed<CityMunicipalityPSGC, CityMunicipality>({
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

      const type: CityMunicipality['type'] = item.isCity
        ? 'CITY'
        : item.isMunicipality
          ? 'MUNICIPALITY'
          : 'NONE';

      const districtCode = typeof item.districtCode === 'string' ? item.districtCode : undefined;

      return {
        name: item.name,
        code: item.code,
        isCapital: item.isCapital,
        oldName: item.oldName,
        type,
        districtCode,
        province: provinceID ? provinceID : null,
        region: regionID,
        islandGroup: islandGroupID,
      };
    },
  });
}

export const seedCitiesMunicipalitiesHandler = createPayloadHandler({
  requireAdmin: true,
  handler: async (req) => seedHandler(req),
  successMessage: (req) => {
    const batchIndex = Number(req.searchParams.get(BATCH_INDEX_KEY) || 0);
    return `${formatCamelCaseCaps(collection)} batch ${batchIndex} seeded successfully.`;
  },
});
