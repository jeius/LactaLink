import { BoundarySchema } from '@lactalink/form-schemas/geocoding';
import { and, eq, isNotNull, sql } from '@payloadcms/db-postgres/drizzle';
import { QueryBuilder } from '@payloadcms/db-postgres/drizzle/pg-core';
import {
  addresses,
  delivery_preferences,
  donations,
  donations_rels,
} from '../schema/payload-schema';

/**
 * Builds a query that selects minimal marker data for available donations whose
 * delivery-preference addresses fall within the given map viewport.
 *
 * Returns one row per delivery-preference address, so a donation with multiple
 * delivery preferences can produce multiple markers.
 *
 * @param viewport - The visible map region expressed as a {@link BoundarySchema}.
 */
export function findDonationMarkersInViewport(viewport: BoundarySchema) {
  const { swLng, swLat, neLng, neLat } = viewport;
  const envelopeSql = sql`ST_MakeEnvelope(${swLng}, ${swLat}, ${neLng}, ${neLat}, 4326)`;

  return (qb: QueryBuilder) =>
    qb
      .select({
        id: donations.id,
        title: donations.title,
        deliveryPreferenceId: donations_rels['delivery-preferencesID'],
        longitude: sql<number>`ST_X(${addresses.coordinates}::geometry)`.as('longitude'),
        latitude: sql<number>`ST_Y(${addresses.coordinates}::geometry)`.as('latitude'),
        snippet: sql<string>`${donations.remainingVolume}::text || ' ml available'`.as('snippet'),
      })
      .from(donations)
      .innerJoin(donations_rels, eq(donations_rels.parent, donations.id))
      .innerJoin(
        delivery_preferences,
        eq(delivery_preferences.id, donations_rels['delivery-preferencesID'])
      )
      .innerJoin(addresses, eq(addresses.id, delivery_preferences.address))
      .where(
        and(
          eq(donations.status, 'AVAILABLE'),
          isNotNull(addresses.coordinates),
          sql`ST_Within(${addresses.coordinates}::geometry, ${envelopeSql})`
        )
      );
}
