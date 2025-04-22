'use server';

/**
 * Imports constants, utilities, and functions used for the seeding operation.
 */
import {
  SEED_BARANGAYS_BATCH_SIZE,
  SEED_CITIES_MUNICIPALITIES_BATCH_SIZE,
  SEED_PROVINCES_BATCH_SIZE,
  SEED_REGIONS_BATCH_SIZE,
} from '@/lib/constants';
import { extractErrorMessage } from '@lactalink/utilities';
import config from '@payload-config';
import { getPayload } from 'payload';
import { fetchPSGCData } from './fetchPSGCData';
import { seed } from './seed';

/**
 * Seeds PSGC (Philippine Standard Geographic Code) data into the database.
 *
 * @returns {Promise<{ message: string; error?: unknown }>} - A message indicating the success or failure of the operation.
 *
 * @description
 * This function orchestrates the seeding of PSGC data into the database in a structured manner.
 * It performs the following steps:
 * 1. Fetches raw PSGC data from an external source.
 * 2. Seeds the data into the database in batches for the following collections:
 *    - Island Groups
 *    - Regions
 *    - Provinces
 *    - Cities/Municipalities
 *    - Barangays
 * 3. Logs the progress and elapsed time for each operation.
 * 4. Handles errors gracefully and logs them.
 *
 * The seeding process ensures that data dependencies are respected (e.g., provinces depend on regions).
 * Batch sizes for each collection are configurable via constants.
 *
 * @example
 * const result = await seedPSGC();
 * console.log(result.message); // "Seed success for PSGC data."
 */
export const seedPSGC = async () => {
  const startTime = Date.now(); // Start timer
  const payload = await getPayload({ config });

  try {
    // Fetch raw filtered data from the PSGC
    const { islandGroups, regions, provinces, citiesMunicipalities, barangays } =
      await fetchPSGCData();

    // Seed Island Groups
    const existingIslandGroups = await seed({
      payload,
      collection: 'islandGroups',
      incomingData: { islandGroups },
    });

    // Seed Regions
    const existingRegions = await seed({
      payload,
      collection: 'regions',
      batchSize: SEED_REGIONS_BATCH_SIZE,
      incomingData: { regions, existingIslandGroups },
    });

    // Seed Provinces
    const existingProvinces = await seed({
      payload,
      collection: 'provinces',
      batchSize: SEED_PROVINCES_BATCH_SIZE,
      incomingData: { provinces, existingIslandGroups, existingRegions },
    });

    // Seed Cities/Municipalities
    const existingCitiesMunicipalities = await seed({
      payload,
      collection: 'citiesMunicipalities',
      batchSize: SEED_CITIES_MUNICIPALITIES_BATCH_SIZE,
      incomingData: {
        citiesMunicipalities,
        existingIslandGroups,
        existingRegions,
        existingProvinces,
      },
    });

    // Seed Barangays
    await seed({
      payload,
      collection: 'barangays',
      batchSize: SEED_BARANGAYS_BATCH_SIZE,
      incomingData: {
        barangays,
        existingIslandGroups,
        existingRegions,
        existingProvinces,
        existingCitiesMunicipalities,
      },
    });

    // Calculate and log the elapsed time
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    const message = 'Seed success for PSGC data.';

    payload.logger.info(`>>> Elapsed time: ${duration} seconds.`);
    return { message };
  } catch (error) {
    // Handle errors and log the elapsed time
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    const message = extractErrorMessage(error);

    payload.logger.error(error, `> ${message}`);
    payload.logger.error(`>>> Elapsed time: ${duration} seconds.`);
    return { message, error };
  }
};
