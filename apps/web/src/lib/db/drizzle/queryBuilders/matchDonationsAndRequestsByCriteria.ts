import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { DeliveryDays, DeliveryMode, MatchCriteria } from '@lactalink/types';
import { and, asc, desc, eq, isNotNull, lte, or, sql } from '@payloadcms/db-postgres/drizzle';
import { QueryBuilder } from '@payloadcms/db-postgres/drizzle/pg-core';
import { matched_donations_requests_view } from '../schema';

const view = matched_donations_requests_view;

export const matchDonationsAndRequestsByCriteria = (
  qb: QueryBuilder,
  criteria: MatchCriteria = {}
) => {
  const {
    status = DONATION_REQUEST_STATUS.AVAILABLE.value,
    maxDistance,
    matchBy = [],
    nearestFirst = true,
  } = criteria;

  const statusCondition = or(eq(view.requestStatus, status), eq(view.donationStatus, status));
  const distanceCondition = maxDistance ? lte(view.distance, maxDistance) : undefined;
  const matchConditions = matchBy.map((field) => {
    switch (field) {
      case 'deliveryMode':
        return isNotNull(view.matchedDeliveryMode);
      case 'deliveryDays':
        return isNotNull(view.matchedDeliveryDay);
      case 'barangay':
        return isNotNull(view.matchedBarangayID);
      case 'cityMunicipality':
        return isNotNull(view.matchedCityMunicipalityID);
      case 'province':
        return isNotNull(view.matchedProvinceID);
      default:
        return undefined;
    }
  });

  const orderBy = nearestFirst ? asc(view.distance) : desc(view.distance);

  return qb
    .select({
      id: view.id,
      requestID: view.requestID,
      donationID: view.donationID,
      distance: view.distance,
      matchedBarangayID: view.matchedBarangayID,
      matchedCityMunicipalityID: view.matchedCityMunicipalityID,
      matchedProvinceID: view.matchedProvinceID,
      matchedDeliveryModes: sql<DeliveryMode[]>`array_agg(DISTINCT ${view.matchedDeliveryMode})`.as(
        'matched_delivery_modes'
      ),
      matchedDeliveryDays: sql<DeliveryDays[]>`array_agg(DISTINCT ${view.matchedDeliveryDay})`.as(
        'matched_delivery_days'
      ),
    })
    .from(view)
    .where(and(statusCondition, distanceCondition, ...matchConditions.filter(Boolean)))
    .orderBy(orderBy)
    .groupBy(
      view.id,
      view.requestID,
      view.donationID,
      view.distance,
      view.matchedBarangayID,
      view.matchedCityMunicipalityID,
      view.matchedProvinceID
    );
};
