import { BATCH_INDEX_KEY } from '@/lib/constants';
import { createPayloadHandler } from '@/lib/utils/createPayloadHandler';
import {
  ExistingDocs,
  IncomingIslandGroupData,
  IslandGroup,
  IslandGroupPSGC,
} from '@lactalink/types';
import { formatCamelCaseCaps } from '@lactalink/utilities/formatString';
import { status as HttpStatus } from 'http-status';
import { APIError, PayloadRequest } from 'payload';
import { seed } from './seeder';

const collection = 'islandGroups';
let batchIndex = 0;

async function seedHandler(req: PayloadRequest): Promise<ExistingDocs> {
  const { payload, user, t, json, searchParams } = req;

  batchIndex = Number(searchParams.get(BATCH_INDEX_KEY) || 0);

  const { islandGroups }: IncomingIslandGroupData = json ? await json() : {};

  if (!islandGroups) {
    throw new APIError(t('error:missingRequiredData'), HttpStatus.NOT_FOUND);
  }

  const { rawData, existingDocs } = islandGroups;

  return await seed<IslandGroupPSGC, IslandGroup>({
    collection,
    payload,
    user,
    rawData,
    existingDocs,
    resolveData: (item) => item,
  });
}

export const seedIslandGroupsHandler = createPayloadHandler({
  requireAdmin: true,
  successMessage: `${formatCamelCaseCaps(collection)} batch ${batchIndex} seeded successfully.`,
  handler: async (req) => seedHandler(req),
});
