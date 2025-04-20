import { status as HttpStatus } from 'http-status';
import { APIError, PayloadHandler } from 'payload';
import { seedStatus } from '../Status/seedStatus';
import { seedBarangays } from './seedBarangays';
import { seedCitiesMunicipalities } from './seedCitiesMunicipalities';
import { seedIslandGroups } from './seedIslandGroups';
import { seedProvinces } from './seedProvinces';
import { seedRegions } from './seedRegions';

export const seedPSGCHandler: PayloadHandler = async (req) => {
  const { user, t, payload } = req;

  const startTime = Date.now(); // Start timer

  try {
    // Only allow admins
    if (!user || user.collection !== 'admins') {
      throw new APIError(t('error:unauthorized'), HttpStatus.UNAUTHORIZED);
    }

    // Clear seed status
    seedStatus.length = 0;

    seedStatus.push(`Seeding island groups...`);
    payload.logger.info(`Seeding island groups...`);
    const islandGroups = await seedIslandGroups(req);

    seedStatus.push(`Seeding regions...`);
    payload.logger.info(`Seeding regions...`);
    const regions = await seedRegions(req, { islandGroups });

    seedStatus.push(`Seeding provinces...`);
    payload.logger.info(`Seeding provinces...`);
    const provinces = await seedProvinces(req, { regions, islandGroups });

    seedStatus.push(`Seeding cities/municipalities...`);
    payload.logger.info(`Seeding cities/municipalities...`);
    const citiesMunicipalities = await seedCitiesMunicipalities(req, {
      islandGroups,
      regions,
      provinces,
    });

    seedStatus.push(`Seeding barangays...`);
    payload.logger.info(`Seeding barangays...`);
    await seedBarangays(req, {
      islandGroups,
      regions,
      provinces,
      citiesMunicipalities,
    });

    const endTime = Date.now(); // End timer
    const durationMs = endTime - startTime;

    const message = 'Seed success for PSGC data.';
    const status = HttpStatus.OK;

    return Response.json({ message, durationMs }, { status });
  } catch (error) {
    const endTime = Date.now();
    const durationMs = endTime - startTime;

    let message = 'Unknown error occurred.';
    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;

    if (error instanceof APIError) {
      message = error.message;
      status = error.status;
    }

    payload.logger.error(error, message);
    payload.logger.error(`DurationMS: ${durationMs}`);
    return Response.json({ message, error, durationMs }, { status });
  }
};
