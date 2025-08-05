import { DeliveryDays, DeliveryMode, DonationRequestStatus } from '@lactalink/types';
import { and, eq, gte, sql } from '@payloadcms/db-postgres/drizzle';
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

export function findMatchedDonationsRequests(qb: QueryBuilder) {
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
      id: sql<number>`row_number() OVER ()`.as('id'),
      requestID: sql<string>`${requests.id}`.as('request_id'),
      requestStatus: sql<DonationRequestStatus>`${requests.status}`.as('request_status'),
      donationID: sql<string>`${donations.id}`.as('donation_id'),
      donationStatus: sql<DonationRequestStatus>`${donations.status}`.as('donation_status'),
      distance: sql<number>`ST_Distance(
          ${addr_req.coordinates}::geography,
          ${addr_don.coordinates}::geography
        )`.as('distance'),
      matchedDeliveryMode: sql<DeliveryMode | null>`
        CASE
          WHEN ${mode_req.value} = ${mode_don.value} THEN ${mode_req.value}
          ELSE NULL
        END
      `.as('matched_delivery_mode'),
      matchedDeliveryDay: sql<DeliveryDays | null>`
        CASE
          WHEN ${day_req.value} = ${day_don.value} THEN ${day_req.value}
          ELSE NULL
        END
      `.as('matched_delivery_day'),
      matchedBarangayID: sql<string | null>`
        CASE
          WHEN ${addr_req.barangay} = ${addr_don.barangay} THEN ${addr_req.barangay}
          ELSE NULL
        END
      `.as('matched_barangay_id'),
      matchedCityMunicipalityID: sql<string | null>`
        CASE
          WHEN ${addr_req.cityMunicipality} = ${addr_don.cityMunicipality} THEN ${addr_req.cityMunicipality}
          ELSE NULL
        END
      `.as('matched_city_municipality_id'),
      matchedProvinceID: sql<string | null>`
        CASE
          WHEN ${addr_req.province} = ${addr_don.province} THEN ${addr_req.province}
          ELSE NULL
        END
      `.as('matched_province_id'),
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
      and(
        gte(donations.remainingVolume, requests.volumeNeeded),
        eq(donations.status, 'AVAILABLE'),
        eq(requests.status, 'AVAILABLE')
      )
    );
}
