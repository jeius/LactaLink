import { BoundarySchema } from '@lactalink/form-schemas/geocoding';
import { and, eq, isNotNull, sql } from '@payloadcms/db-postgres/drizzle';
import { QueryBuilder } from '@payloadcms/db-postgres/drizzle/pg-core';
import {
  addresses,
  delivery_preferences,
  donations,
  donations_rels,
  hospitals,
  milk_banks,
  requests,
  requests_rels,
  users,
  users_rels,
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
