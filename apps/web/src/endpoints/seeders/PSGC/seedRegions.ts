import { BATCH_INDEX_KEY } from '@/lib/constants';
import { createPayloadHandler } from '@/lib/utils/createPayloadHandler';
import type {
  CollectionSlugPSGC,
  ExistingDocs,
  IncomingRegionData,
  Region,
  RegionPSGC,
} from '@lactalink/types';
import { formatCamelCaseCaps } from '@lactalink/utilities/formatString';
import { status as HttpStatus } from 'http-status';
import { APIError, PayloadRequest } from 'payload';
import { getExistingOrThrow } from './utils/getExistingOrThrow';
import { seed } from './utils/seeder';

const collection: CollectionSlugPSGC = 'regions';

export async function seedHandler(req: PayloadRequest): Promise<ExistingDocs> {
  const { payload, user, t, json } = req;

  const { regions, existingIslandGroups }: IncomingRegionData = json ? await json() : {};

  if (!regions || !existingIslandGroups) {
    throw new APIError(t('error:missingRequiredData'), HttpStatus.NOT_FOUND);
  }

  const { rawData, existingDocs } = regions;
  const collectionLabel = payload.collections[collection].config.labels.singular as string;

  return await seed<RegionPSGC, Region>({
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

      return {
        name: item.name,
        regionName: item.regionName,
        code: item.code,
        islandGroup: islandGroupID,
      };
    },
  });
}

export const seedRegionsHandler = createPayloadHandler({
  requireAdmin: true,
  handler: async (req) => seedHandler(req),
  successMessage: (req) => {
    const batchIndex = Number(req.searchParams.get(BATCH_INDEX_KEY) || 0);
    return `${formatCamelCaseCaps(collection)} batch ${batchIndex} seeded successfully.`;
  },
});
