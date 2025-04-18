import { status as HttpStatus } from 'http-status';
import { APIError, PayloadHandler } from 'payload';
import { seedStatus } from '../Status/seedStatus';
import { clearAddresses } from './clearAddresses';
import { seedBarangays } from './seedBarangays';
import { seedCitiesMunicipalities } from './seedCitiesMunicipalities';
import { seedIslandGroups } from './seedIslandGroups';
import { seedProvinces } from './seedProvinces';
import { seedRegions } from './seedRegions';

export const seedPSGCHandler: PayloadHandler = async (req) => {
  const { user, t } = req;
  try {
    // Only allow admins
    if (!user || user.collection !== 'admins') {
      throw new APIError(t('error:unauthorized'), HttpStatus.UNAUTHORIZED);
    }

    // Clear seed status
    seedStatus.length = 0;

    // Clear addresses and related tables.
    await clearAddresses(req);

    seedStatus.push(`Seeding island groups...`);
    const islandGroups = await seedIslandGroups(req);

    seedStatus.push(`Seeding regions...`);
    const regions = await seedRegions(req, { islandGroups });

    seedStatus.push(`Seeding provinces...`);
    const provinces = await seedProvinces(req, { regions, islandGroups });

    seedStatus.push(`Seeding cities/municipalities...`);
    const citiesMunicipalities = await seedCitiesMunicipalities(req, {
      islandGroups,
      regions,
      provinces,
    });

    seedStatus.push(`Seeding barangays...`);
    await seedBarangays(req, { islandGroups, regions, provinces, citiesMunicipalities });

    const message = 'Seed success for PSGC data.';
    const status = HttpStatus.OK;

    return Response.json({ message }, { status });
  } catch (error) {
    let message = 'Unknown error occured.';
    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;

    if (error instanceof APIError) {
      message = error.message;
      status = error.status;
    }

    return Response.json({ message, error }, { status });
  }
};
