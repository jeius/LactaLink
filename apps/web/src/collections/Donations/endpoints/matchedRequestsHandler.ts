import { createPayloadHandler } from '@/lib/utils/createPayloadHandler';
import { getEndpointSearchParams } from '@/lib/utils/getEndpointSearchParams';
import { matchDonationsAndRequestsByCriteria } from '@db/drizzle/queryBuilders';
import { MatchCriteria, Request } from '@lactalink/types';
import { and, eq, sql } from '@payloadcms/db-postgres/drizzle';
import status from 'http-status';
import { APIError, PaginatedDocs } from 'payload';

export const matchedRequestsHandler = createPayloadHandler({
  requireAdmin: false,
  handler: async (req): Promise<PaginatedDocs<Request>> => {
    const { payload, query, pathname } = req;

    const donationID = pathname
      .split('/')
      .filter((part) => !['donations', 'matched-requests'].includes(part))
      .pop();

    if (!donationID) {
      throw new APIError('Donation ID is required', status.BAD_REQUEST, null, true);
    }

    const criteria = query.criteria as MatchCriteria | undefined;
    const { limit = 10, page = 0, ...searchParams } = getEndpointSearchParams(req);

    const match = payload.db.drizzle
      .$with('findMatch')
      .as((qb) => matchDonationsAndRequestsByCriteria(qb, criteria));

    const donationIDCondition = eq(match.donationID, donationID);

    const offset = searchParams.pagination ? page * limit : 0;

    const matches = await payload.db.drizzle
      .with(match)
      .selectDistinctOn([match.requestID], {
        id: match.id,
        requestID: match.requestID,
      })
      .from(match)
      .where(and(donationIDCondition))
      .limit(limit)
      .offset(offset);

    // For accurate totalDocs, use COUNT(DISTINCT requestID)
    const totalRowsResult = await payload.db.drizzle
      .with(match)
      .select({ count: sql<number>`COUNT(DISTINCT ${match.requestID})` })
      .from(match)
      .where(and(donationIDCondition));
    const totalRows = totalRowsResult[0]?.count ?? 0;

    const { docs } = await payload.find({
      ...searchParams,
      collection: 'requests',
      pagination: false,
      req,
      where: {
        and: [{ ...searchParams.where }, { id: { in: matches.map((r) => r.requestID) } }],
      },
    });

    const sortedDocs: Request[] = [];
    const mappedRequests = new Map<string, Request>();

    for (const doc of docs) {
      mappedRequests.set(doc.id, doc);
    }

    for (const match of matches) {
      const request = mappedRequests.get(match.requestID);
      if (request) {
        sortedDocs.push(request);
      }
    }

    return {
      docs: sortedDocs,
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
