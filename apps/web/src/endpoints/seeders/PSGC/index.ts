import { status as HttpStatus } from 'http-status';
import { APIError, PayloadHandler } from 'payload';
import { clearAddresses } from './clearAddresses';
import { seedIslandGroups } from './seedIslandGroups';
import { seedRegions } from './seedRegions';

export const seedPSGCHandler: PayloadHandler = async (req) => {
  const { user, t } = req;
  try {
    if (!user || user.collection !== 'admins') {
      throw new APIError(t('error:unauthorized'), HttpStatus.UNAUTHORIZED);
    }

    await clearAddresses(req);

    const islandGroups = await seedIslandGroups(req);
    const regions = await seedRegions(req, islandGroups);

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
