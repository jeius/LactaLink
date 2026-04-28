import { BoundarySchema } from '@lactalink/form-schemas/geocoding';
import { and, eq, isNotNull, sql } from '@payloadcms/db-postgres/drizzle';
import { QueryBuilder } from '@payloadcms/db-postgres/drizzle/pg-core';
import { addresses, delivery_preferences, requests, requests_rels } from '../schema/payload-schema';

/**
 * Builds a query that selects minimal marker data for available requests whose
 * delivery-preference addresses fall within the given map viewport.
 *
 * Returns one row per delivery-preference address, so a request with multiple
 * delivery preferences can produce multiple markers.
 *
 * @param viewport - The visible map region expressed as a {@link BoundarySchema}.
 */
export function findRequestMarkersInViewport(viewport: BoundarySchema) {
  const { swLng, swLat, neLng, neLat } = viewport;
  const envelopeSql = sql`ST_MakeEnvelope(${swLng}, ${swLat}, ${neLng}, ${neLat}, 4326)`;

  return (qb: QueryBuilder) =>
    qb
      .select({
        id: requests.id,
        title: requests.title,
        deliveryPreferenceId: requests_rels['delivery-preferencesID'],
        longitude: sql<number>`ST_X(${addresses.coordinates}::geometry)`.as('longitude'),
        latitude: sql<number>`ST_Y(${addresses.coordinates}::geometry)`.as('latitude'),
        snippet: sql<string>`${requests.volumeNeeded}::text || ' ml needed'`.as('snippet'),
      })
      .from(requests)
      .innerJoin(requests_rels, eq(requests_rels.parent, requests.id))
      .innerJoin(
        delivery_preferences,
        eq(delivery_preferences.id, requests_rels['delivery-preferencesID'])
      )
      .innerJoin(addresses, eq(addresses.id, delivery_preferences.address))
      .where(
        and(
          eq(requests.status, 'AVAILABLE'),
          isNotNull(addresses.coordinates),
          sql`ST_Within(${addresses.coordinates}::geometry, ${envelopeSql})`
        )
      );
}
