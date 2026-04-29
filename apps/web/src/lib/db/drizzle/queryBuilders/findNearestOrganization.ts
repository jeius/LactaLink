import { Point } from '@lactalink/types';
import { and, asc, eq, isNotNull, sql } from '@payloadcms/db-postgres/drizzle';
import { QueryBuilder } from '@payloadcms/db-postgres/drizzle/pg-core';
import { addresses, hospitals, milk_banks, users, users_rels } from '../schema/payload-schema';

export function findNearestHospital(location: Point) {
  const [lng, lat] = location;
  const sqlPoint = sql`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)`;

  const distanceSql = sql<number>`ST_Distance(
    ${addresses.coordinates}::geography,
    ${sqlPoint}
  )`;

  return (qb: QueryBuilder) =>
    qb
      .select({
        id: hospitals.id,
        type: hospitals.type,
        distance: distanceSql.as('distance'),
      })
      .from(hospitals)
      .innerJoin(
        users_rels,
        and(eq(users_rels.hospitalsID, hospitals.id), eq(users_rels.path, 'profile'))
      )
      .innerJoin(users, eq(users.id, users_rels.parent))
      .innerJoin(addresses, and(eq(addresses.owner, users.id), eq(addresses.isDefault, true)))
      .orderBy(asc(distanceSql))
      .where(isNotNull(addresses.coordinates));
}

export function findNearestMilkbank(location: Point) {
  const [lng, lat] = location;
  const sqlPoint = sql`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)`;

  const distanceSql = sql<number>`ST_Distance(
    ${addresses.coordinates}::geography,
    ${sqlPoint}
  )`;

  return (qb: QueryBuilder) =>
    qb
      .select({
        id: milk_banks.id,
        type: milk_banks.type,
        distance: distanceSql.as('distance'),
      })
      .from(milk_banks)
      .innerJoin(
        users_rels,
        and(eq(users_rels.milkBanksID, milk_banks.id), eq(users_rels.path, 'profile'))
      )
      .innerJoin(users, eq(users.id, users_rels.parent))
      .innerJoin(addresses, and(eq(addresses.owner, users.id), eq(addresses.isDefault, true)))
      .orderBy(asc(distanceSql))
      .where(isNotNull(addresses.coordinates));
}
