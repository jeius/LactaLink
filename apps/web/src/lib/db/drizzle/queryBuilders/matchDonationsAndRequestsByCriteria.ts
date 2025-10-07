import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { MatchCriteria } from '@lactalink/form-schemas/validators';
import { DeliveryDays, DeliveryMode } from '@lactalink/types';
import { and, asc, eq, isNotNull, lte, or, sql } from '@payloadcms/db-postgres/drizzle';
import { PgSelectQueryBuilder, QueryBuilder } from '@payloadcms/db-postgres/drizzle/pg-core';
import { matched_donations_requests_view } from '../schema';

const view = matched_donations_requests_view;

export function matchDonationsAndRequestsByCriteria(criteria: MatchCriteria = {}) {
  const {
    status = DONATION_REQUEST_STATUS.AVAILABLE.value,
    maxDistance,
    matchBy = [],
    nearestFirst = true,
  } = criteria;

  function withWhereConditions<T extends PgSelectQueryBuilder>(qb: T) {
    const statusCondition = or(eq(view.requestStatus, status), eq(view.donationStatus, status));

    const matchBySet = new Set(matchBy);
    const locationConditions = matchBySet
      .values()
      .map((v) => {
        if (v === 'barangay') {
          return isNotNull(view.matchedBarangayID);
        } else if (v === 'cityMunicipality') {
          return isNotNull(view.matchedCityMunicipalityID);
        } else if (v === 'province') {
          return isNotNull(view.matchedProvinceID);
        }
        return null;
      })
      .filter((v) => v !== null);

    const conditions = [statusCondition, or(...locationConditions)];

    if (maxDistance) {
      conditions.push(lte(view.distance, maxDistance));
    }

    if (matchBySet.has('deliveryMode')) {
      conditions.push(isNotNull(view.matchedDeliveryMode));
    }

    if (matchBySet.has('deliveryDays')) {
      conditions.push(isNotNull(view.matchedDeliveryDay));
    }

    return qb.where(and(...conditions));
  }

  function withOrderByDistance<T extends PgSelectQueryBuilder>(qb: T) {
    if (nearestFirst) {
      return qb.orderBy(asc(view.distance));
    }
    return qb;
  }

  return (qb: QueryBuilder) => {
    let query = qb
      .select({
        id: view.id,
        requestID: view.requestID,
        donationID: view.donationID,
        distance: view.distance,
        matchedBarangayID: view.matchedBarangayID,
        matchedCityMunicipalityID: view.matchedCityMunicipalityID,
        matchedProvinceID: view.matchedProvinceID,
        matchedDeliveryModes: sql<DeliveryMode[]>`array_agg(DISTINCT ${view.matchedDeliveryMode})`,
        matchedDeliveryDays: sql<DeliveryDays[]>`array_agg(DISTINCT ${view.matchedDeliveryDay})`,
      })
      .from(view)
      .groupBy(
        view.id,
        view.requestID,
        view.donationID,
        view.distance,
        view.matchedBarangayID,
        view.matchedCityMunicipalityID,
        view.matchedProvinceID
      )
      .$dynamic();

    query = withWhereConditions(query);
    query = withOrderByDistance(query);
    return query;
  };
}
