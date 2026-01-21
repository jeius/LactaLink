import { PgTableWithColumns, pgView, TableConfig } from '@payloadcms/db-postgres/drizzle/pg-core';
import { findMatchedDonationsRequests } from '../queryBuilders/findMatchedDonationsRequests';

export const matched_donations_requests_view = pgView('matched_donations_requests_view').as((qb) =>
  findMatchedDonationsRequests(qb)
);

export const views: Record<string, PgTableWithColumns<TableConfig>> = {
  // @ts-expect-error Payload postgress adapter does not support views in schema, it expects tables only
  // however, we can still use this view in our queries
  matched_donations_requests_view: matched_donations_requests_view,
};
