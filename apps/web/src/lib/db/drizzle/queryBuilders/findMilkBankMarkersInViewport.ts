import { BoundarySchema } from '@lactalink/form-schemas/geocoding';
import { and, eq, isNotNull, sql } from '@payloadcms/db-postgres/drizzle';
import { QueryBuilder } from '@payloadcms/db-postgres/drizzle/pg-core';
import { addresses, milk_banks, users, users_rels } from '../schema/payload-schema';

/**
 * Builds a query that selects minimal marker data for milk banks whose owner
 * user's default address falls within the given map viewport.
 *
 * The address is resolved through the join chain:
 * `milk_banks → users_rels (path='profile') → users → addresses (isDefault=true)`
 *
 * @param viewport - The visible map region expressed as a {@link BoundarySchema}.
 */
export function findMilkBankMarkersInViewport(viewport: BoundarySchema) {
  const { swLng, swLat, neLng, neLat } = viewport;
  const envelopeSql = sql`ST_MakeEnvelope(${swLng}, ${swLat}, ${neLng}, ${neLat}, 4326)`;

  return (qb: QueryBuilder) =>
    qb
      .select({
        id: milk_banks.id,
        title: sql<string>`COALESCE(${milk_banks.displayName}, ${milk_banks.name})`.as('title'),
        longitude: sql<number>`ST_X(${addresses.coordinates}::geometry)`.as('longitude'),
        latitude: sql<number>`ST_Y(${addresses.coordinates}::geometry)`.as('latitude'),
        snippet: sql<string>`${milk_banks.totalVolume}::text || ' ml in stock'`.as('snippet'),
      })
      .from(milk_banks)
      .innerJoin(
        users_rels,
        and(eq(users_rels.milkBanksID, milk_banks.id), eq(users_rels.path, 'profile'))
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
