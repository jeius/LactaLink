import { Point } from '@lactalink/types';
import { asc, eq, getTableColumns, sql } from '@payloadcms/db-postgres/drizzle';
import { QueryBuilder } from '@payloadcms/db-postgres/drizzle/pg-core';
import {
  addresses,
  delivery_preferences,
  donations,
  donations_rels,
} from '../schema/payload-schema';

export function findNearestDonations(location: Point) {
  const [lng, lat] = location;
  const sqlPoint = sql`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)`;

  const distanceSql = sql<number>`ST_Distance(
    ${addresses.coordinates}::geography,
    ${sqlPoint}
  )`;

  const fields = getTableColumns(donations);

  return (qb: QueryBuilder) =>
    qb
      .select({
        ...fields,
        distance: distanceSql.as('distance'),
      })
      .from(donations)
      .innerJoin(donations_rels, eq(donations_rels.parent, donations.id))
      .innerJoin(
        delivery_preferences,
        eq(delivery_preferences.id, donations_rels['delivery-preferencesID'])
      )
      .innerJoin(addresses, eq(addresses.id, delivery_preferences.address))
      .orderBy(asc(distanceSql));
}
