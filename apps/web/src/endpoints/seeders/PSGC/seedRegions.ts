import { BATCH_INDEX_KEY } from '@/lib/constants';
import { createPayloadHandler } from '@/lib/utils/createPayloadHandler';
import type { ExistingDocs, IncomingRegionData, Region, RegionPSGC } from '@lactalink/types';
import { formatCamelCaseCaps } from '@lactalink/utilities/formatString';
import { status as HttpStatus } from 'http-status';
import { APIError, PayloadRequest } from 'payload';
import { seed } from './seeder';

const collection = 'regions';
let batchIndex = 0;

export async function seedHandler(req: PayloadRequest): Promise<ExistingDocs> {
  const { payload, user, t, json, searchParams } = req;

  batchIndex = Number(searchParams.get(BATCH_INDEX_KEY) || 0);

  const { regions, existingIslandGroups }: IncomingRegionData = json ? await json() : {};

  if (!regions || !existingIslandGroups) {
    throw new APIError(t('error:missingRequiredData'), HttpStatus.NOT_FOUND);
  }

  const { rawData, existingDocs } = regions;

  return await seed<RegionPSGC, Region>({
    collection,
    payload,
    user,
    rawData,
    existingDocs,
    resolveData: (item) => {
      const islandGroupID = existingIslandGroups[item.islandGroupCode];
      if (!islandGroupID) {
        throw new APIError(`Missing Island Group for region ${item.name}.`, HttpStatus.NOT_FOUND);
      }
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
  successMessage: `${formatCamelCaseCaps(collection)} batch ${batchIndex} seeded successfully.`,
  handler: async (req) => seedHandler(req),
});
