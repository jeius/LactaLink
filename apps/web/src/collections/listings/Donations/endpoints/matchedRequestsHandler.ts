import { createBadRequestError } from '@/lib/utils/createError';
import { createPayloadHandler } from '@/lib/utils/createPayloadHandler';
import { getQueryOptions } from '@/lib/utils/getEndpointSearchParams';
import { parseZodSchema } from '@/lib/utils/parseZodSchema';
import { matchDonationsAndRequestsByCriteria } from '@db/drizzle/queryBuilders';
import { matchCriteriaSchema } from '@lactalink/form-schemas/validators';
import { Request } from '@lactalink/types/payload-generated-types';
import { and, eq, sql } from '@payloadcms/db-postgres/drizzle';
import { PaginatedDocs, PayloadRequest } from 'payload';

export const matchedRequestsHandler = createPayloadHandler({
  requireAdmin: false,
  requireAuth: true,
  handler: handler,
});

async function handler(req: PayloadRequest): Promise<PaginatedDocs<Request>> {
  const { payload, query, pathname } = req;

  // Get the ID from the pathname, which should be in the format /api/donations/:id/matched-requests
  const donationID = pathname
    .split('/')
    .filter((part) => !['donations', 'matched-requests'].includes(part)) //['api', ':id']
    .pop();

  if (!donationID) {
    throw createBadRequestError('Donation ID is required in the URL');
  }

  const criteria = parseZodSchema(matchCriteriaSchema, query.criteria);
  const { limit = 10, page = 0, ...searchParams } = getQueryOptions(req);

  const match = payload.db.drizzle
    .$with('findMatch')
    .as(matchDonationsAndRequestsByCriteria(criteria));

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

  const totalRowsResult = await payload.db.drizzle
    .with(match)
    .select({ count: sql<number>`COUNT(DISTINCT ${match.requestID})` })
    .from(match)
    .where(and(donationIDCondition));
  const totalRows = totalRowsResult[0]?.count ?? 0;

  let docs: Request[] = [];

  if (matches.length) {
    const findResults = await payload.find({
      ...searchParams,
      collection: 'requests',
      pagination: false,
      req,
      where: {
        and: [{ ...searchParams.where }, { id: { in: matches.map((m) => m.requestID) } }],
      },
    });
    docs = findResults.docs;
  }

  // Sort the docs based on the order of matches
  const sortedDocs: Request[] = [];

  // Create a map for quick lookup
  const mappedRequests = new Map<string, Request>();
  for (const doc of docs) {
    mappedRequests.set(doc.id, doc);
  }

  // Iterate over matches and push the corresponding doc to sortedDocs
  for (const match of matches) {
    const request = mappedRequests.get(match.requestID);
    if (request) {
      sortedDocs.push(request);
    }
  }

  // Return paginated response
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
}
