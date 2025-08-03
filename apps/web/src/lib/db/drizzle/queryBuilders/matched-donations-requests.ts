import { eq, sql } from '@payloadcms/db-postgres/drizzle';
import { alias, QueryBuilder } from '@payloadcms/db-postgres/drizzle/pg-core';
import {
  addresses,
  delivery_preferences,
  delivery_preferences_available_days,
  delivery_preferences_preferred_mode,
  donations,
  donations_rels,
  requests,
  requests_rels,
} from '../schema/payload-schema';

export const findMatchedDonationRequests = (qb: QueryBuilder) => {
  const mode_don = alias(delivery_preferences_preferred_mode, 'mode_don');
  const day_don = alias(delivery_preferences_available_days, 'day_don');
  const addr_don = alias(addresses, 'addr_don');
  const dp_req = alias(delivery_preferences, 'dp_req');
  const mode_req = alias(delivery_preferences_preferred_mode, 'mode_req');
  const day_req = alias(delivery_preferences_available_days, 'day_req');
  const addr_req = alias(addresses, 'addr_req');
  const dp_don = alias(delivery_preferences, 'dp_don');

  return qb
    .select({
      id: sql`row_number() OVER ()`.as('id'),
      request_id: requests.id,
      request_status: requests.status,
      donation_id: donations.id,
      donation_status: donations.status,
      distance: sql`ST_Distance(
          ${addr_req.coordinates}::geography,
          ${addr_don.coordinates}::geography
        )`.as('distance'),
      matched_delivery_mode: mode_req.value,
      matched_delivery_days: day_req.value,
      matched_barangay_id: addr_req.barangay,
      matched_city_municipality_id: addr_req.cityMunicipality,
      matched_province_id: addr_req.province,
    })
    .from(donations)
    .innerJoin(donations_rels, eq(donations_rels.parent, donations.id))
    .innerJoin(dp_don, eq(dp_don.id, donations_rels['delivery-preferencesID']))
    .innerJoin(mode_don, eq(mode_don.parent, dp_don.id))
    .innerJoin(day_don, eq(day_don.parent, dp_don.id))
    .innerJoin(addr_don, eq(addr_don.id, dp_don.address))
    .innerJoin(requests, sql`1=1`)
    .innerJoin(requests_rels, eq(requests_rels.parent, requests.id))
    .innerJoin(dp_req, eq(dp_req.id, requests_rels['delivery-preferencesID']))
    .innerJoin(mode_req, eq(mode_req.parent, dp_req.id))
    .innerJoin(day_req, eq(day_req.parent, dp_req.id))
    .innerJoin(addr_req, eq(addr_req.id, dp_req.address))
    .where(
      sql`
          ${donations.remainingVolume} >= ${requests.volumeNeeded}
          AND ${day_req.value} = ${day_don.value}
          AND ${mode_req.value} = ${mode_don.value}
        `
    );
};
