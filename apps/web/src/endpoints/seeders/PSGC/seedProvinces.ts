import { BATCH_INDEX_KEY } from '@/lib/constants';
import { createPayloadHandler } from '@/lib/utils/createPayloadHandler';
import type {
  CollectionSlugPSGC,
  ExistingDocs,
  IncomingProvinceData,
  Province,
  ProvincePSGC,
} from '@lactalink/types';
import { formatCamelCaseCaps } from '@lactalink/utilities/formatString';
import { status as HttpStatus } from 'http-status';
import { APIError, PayloadRequest } from 'payload';
import { getExistingOrThrow } from './utils/getExistingOrThrow';
import { seed } from './utils/seeder';

const collection: CollectionSlugPSGC = 'provinces';

export async function seedHandler(req: PayloadRequest): Promise<ExistingDocs> {
  const { payload, user, t, json } = req;

  const { provinces, existingIslandGroups, existingRegions }: IncomingProvinceData = json
    ? await json()
    : {};

  if (!provinces || !existingIslandGroups || !existingRegions) {
    throw new APIError(t('error:missingRequiredData'), HttpStatus.NOT_FOUND);
  }

  const { rawData, existingDocs } = provinces;
  const collectionLabel = payload.collections[collection].config.labels.singular as string;

  return await seed<ProvincePSGC, Province>({
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
      return {
        name: item.name,
        code: item.code,
        region: regionID,
        islandGroup: islandGroupID,
      };
    },
  });
}

export const seedProvincesHandler = createPayloadHandler({
  requireAdmin: true,
  handler: async (req) => seedHandler(req),
  successMessage: (req) => {
    const batchIndex = Number(req.searchParams.get(BATCH_INDEX_KEY) || 0);
    return `${formatCamelCaseCaps(collection)} batch ${batchIndex} seeded successfully.`;
  },
});
