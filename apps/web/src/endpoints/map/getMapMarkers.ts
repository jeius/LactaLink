import {
  findDonationMarkersInViewport,
  findHospitalMarkersInViewport,
  findMilkBankMarkersInViewport,
  findRequestMarkersInViewport,
} from '@/lib/db/drizzle/queryBuilders';
import { createPayloadHandler } from '@/lib/utils/createPayloadHandler';
import { ValidationErrorNames } from '@lactalink/enums/error-names';
import { MARKER_TYPES, mapMarkersQuerySchema } from '@lactalink/form-schemas/validators';
import { MapMarker, MapMarkersResult } from '@lactalink/types/api';
import { ValidationError } from '@lactalink/utilities/errors';
import httpStatus from 'http-status';
import { PayloadRequest } from 'payload';

export const getMapMarkersHandler = createPayloadHandler({
  requireAuth: true,
  handler,
});

async function handler(req: PayloadRequest): Promise<MapMarkersResult> {
  const { payload, query } = req;

  const parseResult = mapMarkersQuerySchema.safeParse(query);

  if (!parseResult.success) {
    const error = parseResult.error.issues.pop();
    throw new ValidationError(error?.message ?? 'Invalid query parameters.', {
      name: ValidationErrorNames.INVALID_TYPE,
      statusCode: httpStatus.BAD_REQUEST,
    });
  }

  const { types = [...MARKER_TYPES], ...viewport } = parseResult.data;

  const markerPromises: Promise<MapMarker[]>[] = [];

  if (types.includes('donations')) {
    const cte = payload.db.drizzle.$with('dm').as(findDonationMarkersInViewport(viewport));
    markerPromises.push(
      payload.db.drizzle
        .with(cte)
        .select({
          id: cte.id,
          title: cte.title,
          latitude: cte.latitude,
          longitude: cte.longitude,
          snippet: cte.snippet,
          deliveryPreferenceId: cte.deliveryPreferenceId,
        })
        .from(cte)
        .then((rows) =>
          rows.map((row) => ({
            id: row.id,
            type: 'donations' as const,
            coordinate: { latitude: row.latitude, longitude: row.longitude },
            title: row.title,
            ...(row.snippet && { snippet: row.snippet }),
            ...(row.deliveryPreferenceId && { deliveryPreferenceId: row.deliveryPreferenceId }),
          }))
        )
    );
  }

  if (types.includes('requests')) {
    const cte = payload.db.drizzle.$with('rm').as(findRequestMarkersInViewport(viewport));
    markerPromises.push(
      payload.db.drizzle
        .with(cte)
        .select({
          id: cte.id,
          title: cte.title,
          latitude: cte.latitude,
          longitude: cte.longitude,
          snippet: cte.snippet,
          deliveryPreferenceId: cte.deliveryPreferenceId,
        })
        .from(cte)
        .then((rows) =>
          rows.map((row) => ({
            id: row.id,
            type: 'requests' as const,
            coordinate: { latitude: row.latitude, longitude: row.longitude },
            title: row.title,
            ...(row.snippet && { snippet: row.snippet }),
            ...(row.deliveryPreferenceId && { deliveryPreferenceId: row.deliveryPreferenceId }),
          }))
        )
    );
  }

  if (types.includes('hospitals')) {
    const cte = payload.db.drizzle.$with('hm').as(findHospitalMarkersInViewport(viewport));
    markerPromises.push(
      payload.db.drizzle
        .with(cte)
        .select({
          id: cte.id,
          title: cte.title,
          latitude: cte.latitude,
          longitude: cte.longitude,
          snippet: cte.snippet,
        })
        .from(cte)
        .then((rows) =>
          rows.map((row) => ({
            id: row.id,
            type: 'hospitals' as const,
            coordinate: { latitude: row.latitude, longitude: row.longitude },
            title: row.title,
            ...(row.snippet && { snippet: row.snippet }),
          }))
        )
    );
  }

  if (types.includes('milkBanks')) {
    const cte = payload.db.drizzle.$with('mbm').as(findMilkBankMarkersInViewport(viewport));
    markerPromises.push(
      payload.db.drizzle
        .with(cte)
        .select({
          id: cte.id,
          title: cte.title,
          latitude: cte.latitude,
          longitude: cte.longitude,
          snippet: cte.snippet,
        })
        .from(cte)
        .then((rows) =>
          rows.map((row) => ({
            id: row.id,
            type: 'milkBanks' as const,
            coordinate: { latitude: row.latitude, longitude: row.longitude },
            title: row.title,
            ...(row.snippet && { snippet: row.snippet }),
          }))
        )
    );
  }

  const results = await Promise.all(markerPromises);
  return results.flat();
}
