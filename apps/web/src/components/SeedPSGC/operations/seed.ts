/**
 * Imports constants, utilities, and types used for the seeding operation.
 */
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

/**
 * Default batch size for processing raw data.
 */
const BATCH_SIZE = 100;

/**
 * Represents the structure of incoming data for a specific collection.
 */
type IncomingData<T, Slug> = Slug extends keyof T ? T : never;

/**
 * Represents the possible types of seed data for PSGC collections.
 */
type SeedData =
  | IncomingIslandGroupData
  | IncomingRegionData
  | IncomingProvinceData
  | IncomingCityMunicipalityData
  | IncomingBarangayData;

/**
 * Parameters required for the `seed` function.
 *
 * @template T - The type of the seed data.
 * @template Slug - The type of the collection slug.
 */
type SeedParams<T, Slug> = {
  /**
   * The name of the collection to seed.
   */
  collection: Slug;

  /**
   * The size of each batch to process. Defaults to `BATCH_SIZE`.
   */
  batchSize?: number;

  /**
   * The incoming data to seed into the collection.
   */
  incomingData: IncomingData<T, Slug>;
};

/**
 * Seeds data into a specified PSGC collection in batches.
 *
 * @template T - The type of the seed data.
 * @template Slug - The type of the collection slug.
 *
 * @param {SeedParams<T, Slug>} params - The parameters for the seeding operation.
 * @returns {Promise<ExistingDocs>} - A map of existing documents after seeding.
 *
 * @description
 * This function processes raw data in batches and sends each batch to the server for seeding.
 * It ensures that the seeding operation is efficient and avoids overloading the server.
 * The function:
 * - Splits the raw data into smaller batches.
 * - Sends each batch to the server via an API call.
 * - Logs the progress and handles errors for each batch.
 * - Merges the results of all batches into the `existingDocs` map.
 *
 * @example
 * const seedParams = {
 *   collection: 'regions',
 *   incomingData: { regions: { rawData: [...], existingDocs: {} } },
 *   payload,
 * };
 * const existingDocs = await seed(seedParams);
 */
export async function seed<T extends SeedData, Slug extends CollectionSlugPSGC>({
  collection,
  batchSize = BATCH_SIZE,
  incomingData,
}: SeedParams<T, Slug>): Promise<ExistingDocs> {
  type Placeholder = Record<Slug, { rawData: object[]; existingDocs: ExistingDocs }>;
  const { rawData, existingDocs } = (incomingData as Placeholder)[collection];
  const batches = getChunks(rawData, batchSize);

  console.log(`>`);
  console.log(`>>> Seeding ${formatCamelCase(collection)}...`);

  // Skip seeding if there is no raw data.
  if (batches.length === 0) {
    console.log(`>> ${formatCamelCaseCaps(collection)} already seeded, skipping...`);
    return existingDocs;
  }

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batchRawData = batches[batchIndex];
    (incomingData as Placeholder)[collection].rawData = batchRawData;

    console.log(`>>> Seeding ${formatCamelCaseCaps(collection)}, batch ${batchIndex}`);

    const url = new URL(`/api/seed/${toKebabCase(collection)}`, getServerSideURL());
    url.searchParams.set(BATCH_INDEX_KEY, String(batchIndex));

    const start = Date.now();

    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(incomingData),
    });

    const end = Date.now();
    const duration = ((end - start) / 1000).toFixed(2);
    console.log(`>> Batch ${batchIndex} finish: ${duration} seconds.`);

    if (!res.ok) {
      throw new Error(`Batch ${batchIndex} failed: HTTP ${res.status}`);
    }

    const resData: APIResponse<ExistingDocs> = await res.json();
    if ('data' in resData && resData.data) {
      Object.assign(existingDocs, resData.data);
    } else {
      throw new Error(`Batch ${batchIndex} failed: ${resData.message}`);
    }
  }

  return existingDocs;
}
