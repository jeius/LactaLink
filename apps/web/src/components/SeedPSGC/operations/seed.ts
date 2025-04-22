'use server';

import { BATCH_INDEX_KEY } from '@/lib/constants';
import { getServerSideURL } from '@/lib/utils/getServerSideUrl';
import {
  APIResponse,
  CollectionSlugPSGC,
  ExistingDocs,
  IncomingBarangayData,
  IncomingCityMunicipalityData,
  IncomingIslandGroupData,
  IncomingProvinceData,
  IncomingRegionData,
} from '@lactalink/types';
import { formatCamelCase, formatCamelCaseCaps, getChunks, toKebabCase } from '@lactalink/utilities';
import { Payload } from 'payload';

const BATCH_SIZE = 100;

type IncomingData<T extends SeedData, Slug extends CollectionSlugPSGC> = Slug extends keyof T
  ? T
  : never;

type SeedData =
  | IncomingIslandGroupData
  | IncomingRegionData
  | IncomingProvinceData
  | IncomingCityMunicipalityData
  | IncomingBarangayData;

type SeedParams<T extends SeedData, Slug extends CollectionSlugPSGC> = {
  collection: Slug;
  batchSize?: number;
  incomingData: IncomingData<T, Slug>;
  payload: Payload;
};

export async function seed<T extends SeedData, Slug extends CollectionSlugPSGC>({
  collection,
  batchSize = BATCH_SIZE,
  incomingData,
  payload,
}: SeedParams<T, Slug>): Promise<ExistingDocs> {
  const { rawData, existingDocs } = incomingData[collection];
  const batches = getChunks(rawData, batchSize);

  payload.logger.info(`>`);
  payload.logger.info(`>>> Seeding ${formatCamelCase(collection)}...`);

  if (batches.length === 0) {
    // Skip seeding for this collection if raw data is empty.
    payload.logger.info(`>> Empty raw data, skipping seed for ${formatCamelCaseCaps(collection)}`);
    return existingDocs;
  }

  const batchesToExecute: (() => Promise<ExistingDocs>)[] = [];

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batchRawData = batches[batchIndex];
    incomingData[collection].rawData = batchRawData;

    batchesToExecute.push(async () => {
      payload.logger.info(`>>> Seeding ${formatCamelCaseCaps(collection)}, batch ${batchIndex}`);

      const url = new URL(`/api/seed/${toKebabCase(collection)}`, getServerSideURL());
      url.searchParams.set(BATCH_INDEX_KEY, String(batchIndex));

      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(incomingData),
      });

      const resData: APIResponse<ExistingDocs> = await res.json();
      if ('data' in resData) {
        return resData.data;
      } else {
        throw new Error(`Batch ${batchIndex} failed: ${resData.message}`);
      }
    });
  }

  const results = await Promise.all(batchesToExecute.map((fn) => fn()));

  for (const newExistingDocs of results) {
    Object.assign(existingDocs, newExistingDocs);
  }

  return existingDocs;
}
