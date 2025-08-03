import { createPayloadHandler } from '@/lib/utils/createPayloadHandler';
import { getEndpointSearchParams } from '@/lib/utils/getEndpointSearchParams';
import { matchDonationsAndRequestsByCriteria } from '@db/drizzle/queryBuilders';
import { Donation, MatchCriteria } from '@lactalink/types';
import { and, eq, sql } from '@payloadcms/db-postgres/drizzle';
import status from 'http-status';
import { APIError, PaginatedDocs } from 'payload';

export const matchedDonationsHandler = createPayloadHandler({
  requireAdmin: false,
  handler: async (req): Promise<PaginatedDocs<Donation>> => {
    const { payload, query, pathname } = req;

    const requestID = pathname
      .split('/')
      .filter((part) => !['requests', 'matched-donations'].includes(part))
      .pop();

    if (!requestID) {
      throw new APIError('Donation ID is required', status.BAD_REQUEST, null, true);
    }

    const criteria = query.criteria as MatchCriteria | undefined;
    const { limit = 10, page = 0, ...searchParams } = getEndpointSearchParams(req);

    const match = payload.db.drizzle
      .$with('findMatch')
      .as((qb) => matchDonationsAndRequestsByCriteria(qb, criteria));

    const requestIDCondition = eq(match.requestID, requestID);

    const offset = searchParams.pagination ? page * limit : 0;

    const matches = await payload.db.drizzle
      .with(match)
      .selectDistinctOn([match.donationID], {
        id: match.id,
        donationID: match.donationID,
      })
      .from(match)
      .where(and(requestIDCondition))
      .limit(limit)
      .offset(offset);

    // For accurate totalDocs, use COUNT(DISTINCT requestID)
    const totalRowsResult = await payload.db.drizzle
      .with(match)
      .select({ count: sql<number>`COUNT(DISTINCT ${match.donationID})` })
      .from(match)
      .where(and(requestIDCondition));
    const totalRows = totalRowsResult[0]?.count ?? 0;

    const { docs } = await payload.find({
      ...searchParams,
      collection: 'donations',
      pagination: false,
      req,
      where: {
        and: [{ ...searchParams.where }, { id: { in: matches.map((r) => r.donationID) } }],
      },
    });

    return {
      docs: docs,
      totalDocs: totalRows,
      totalPages: Math.ceil(totalRows / limit),
      page: searchParams.pagination ? page : 1,
      limit,
      nextPage: searchParams.pagination && (page + 1) * limit < totalRows ? page + 1 : null,
      prevPage: searchParams.pagination && page > 0 ? page - 1 : null,
      hasNextPage: searchParams.pagination ? (page + 1) * limit < totalRows : false,
      hasPrevPage: Boolean(searchParams.pagination) && page > 0,
      pagingCounter: searchParams.pagination ? page * limit + 1 : 1,
    };
  },
});
