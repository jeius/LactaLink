/**
 * Imports constants, utilities, and types used for the seeding operation.
 */
import { BATCH_INDEX_KEY } from '@/lib/constants';
import { getServerSideURL } from '@/lib/utils/getURL';
import { ApiFetchResponse, CollectionSlugPSGC, ExistingDocs, IncomingData } from '@lactalink/types';
import { getChunks } from '@lactalink/utilities';
import { formatCamelCase, formatCamelCaseCaps, toKebabCase } from '@lactalink/utilities/formatters';

/**
 * Default batch size for processing raw data.
 */
const BATCH_SIZE = 100;

/**
 * Parameters required for the `seed` function.
 *
 * @template Slug - The type of the collection slug.
 */
type SeedParams<Slug extends CollectionSlugPSGC> = {
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
  incomingData: IncomingData<Slug>;
};

export async function seed<Slug extends CollectionSlugPSGC>({
  collection,
  batchSize = BATCH_SIZE,
  incomingData,
}: SeedParams<Slug>): Promise<ExistingDocs<Slug>> {
  const { data } = incomingData;
  const batches = getChunks(data.rawData, batchSize);

  console.log(`>`);
  console.log(`>>> Seeding ${formatCamelCase(collection)}...`);

  // Skip seeding if there is no raw data.
  if (batches.length === 0) {
    console.log(`>> ${formatCamelCaseCaps(collection)} already seeded, skipping...`);
    return data.existingDocs;
  }

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batchRawData = batches[batchIndex];

    if (batchRawData) incomingData.data.rawData = batchRawData;

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

    const resData: ApiFetchResponse<ExistingDocs> = await res.json();
    if ('data' in resData && resData.data) {
      Object.assign(data.existingDocs, resData.data);
    } else {
      throw new Error(`Batch ${batchIndex} failed: ${resData.message}`);
    }
  }

  return data.existingDocs;
}
