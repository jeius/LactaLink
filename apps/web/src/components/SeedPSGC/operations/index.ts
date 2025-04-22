'use server';

import {
  SEED_BARANGAYS_BATCH_SIZE,
  SEED_CITIES_MUNICIPALITIES_BATCH_SIZE,
  SEED_PROVINCES_BATCH_SIZE,
  SEED_REGIONS_BATCH_SIZE,
} from '@/lib/constants';
import { extractErrorMessage } from '@lactalink/utilities';
import config from '@payload-config';
import { getPayload } from 'payload';
import { seed } from './seed';
import { fetchPSGCData } from './startSeed';

export const seedPSGC = async () => {
  const startTime = Date.now(); // Start timer
  const payload = await getPayload({ config });

  try {
    // Fetch raw filtered data from the PSGC
    const { islandGroups, regions, provinces, citiesMunicipalities, barangays } =
      await fetchPSGCData();

    const existingIslandGroups = await seed({
      payload,
      collection: 'islandGroups',
      incomingData: { islandGroups },
    });
    const existingRegions = await seed({
      payload,
      collection: 'regions',
      batchSize: SEED_REGIONS_BATCH_SIZE,
      incomingData: { regions, existingIslandGroups },
    });
    const existingProvinces = await seed({
      payload,
      collection: 'provinces',
      batchSize: SEED_PROVINCES_BATCH_SIZE,
      incomingData: { provinces, existingIslandGroups, existingRegions },
    });

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

    const endTime = Date.now(); // End timer
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    const message = 'Seed success for PSGC data.';

    payload.logger.info(`>>> Elapsed time: ${duration} seconds.`);
    return { message };
  } catch (error) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    const message = extractErrorMessage(error);

    payload.logger.error(error, `> ${message}`);
    payload.logger.error(`>>> Elapsed time: ${duration} seconds.`);
    return { message, error };
  }
};
