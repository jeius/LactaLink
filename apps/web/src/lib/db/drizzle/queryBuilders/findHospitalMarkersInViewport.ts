import { BoundarySchema } from '@lactalink/form-schemas/geocoding';
import { and, eq, isNotNull, sql } from '@payloadcms/db-postgres/drizzle';
import { QueryBuilder } from '@payloadcms/db-postgres/drizzle/pg-core';
import { addresses, hospitals, users, users_rels } from '../schema/payload-schema';

/**
 * Builds a query that selects minimal marker data for hospitals whose owner
 * user's default address falls within the given map viewport.
 *
 * The address is resolved through the join chain:
 * `hospitals → users_rels (path='profile') → users → addresses (isDefault=true)`
 *
 * @param viewport - The visible map region expressed as a {@link BoundarySchema}.
 */
export function findHospitalMarkersInViewport(viewport: BoundarySchema) {
  const { swLng, swLat, neLng, neLat } = viewport;
  const envelopeSql = sql`ST_MakeEnvelope(${swLng}, ${swLat}, ${neLng}, ${neLat}, 4326)`;

  return (qb: QueryBuilder) =>
    qb
      .select({
        id: hospitals.id,
        title: sql<string>`COALESCE(${hospitals.displayName}, ${hospitals.name})`.as('title'),
        longitude: sql<number>`ST_X(${addresses.coordinates}::geometry)`.as('longitude'),
        latitude: sql<number>`ST_Y(${addresses.coordinates}::geometry)`.as('latitude'),
        snippet: sql<string>`${hospitals.totalVolume}::text || ' ml in stock'`.as('snippet'),
      })
      .from(hospitals)
      .innerJoin(
        users_rels,
        and(eq(users_rels.hospitalsID, hospitals.id), eq(users_rels.path, 'profile'))
      )
      .innerJoin(users, eq(users.id, users_rels.parent))
      .innerJoin(addresses, and(eq(addresses.owner, users.id), eq(addresses.isDefault, true)))
      .where(
        and(
          isNotNull(addresses.coordinates),
          sql`ST_Within(${addresses.coordinates}::geometry, ${envelopeSql})`
        )
      );
}
