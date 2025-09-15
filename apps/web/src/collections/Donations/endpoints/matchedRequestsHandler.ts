import { createPayloadHandler } from '@/lib/utils/createPayloadHandler';
import { getEndpointSearchParams } from '@/lib/utils/getEndpointSearchParams';
import { matchDonationsAndRequestsByCriteria } from '@db/drizzle/queryBuilders';
import { ValidationErrorNames } from '@lactalink/enums/error-names';
import { MatchCriteria } from '@lactalink/types';
import { Request } from '@lactalink/types/payload-generated-types';
import { matchCriteriaSchema } from '@lactalink/types/schemas';
import { ValidationError } from '@lactalink/utilities/errors';
import { and, eq, sql } from '@payloadcms/db-postgres/drizzle';
import status from 'http-status';
import { APIError, PaginatedDocs, PayloadRequest } from 'payload';
import z from 'zod';

export const matchedRequestsHandler = createPayloadHandler({
  requireAdmin: false,
  handler: async (req) => {
    try {
      return await handler(req);
    } catch (err) {
      if (err instanceof ValidationError) {
        throw new APIError(err.message, err.statusCode, err, true);
      }
      throw err;
    }
  },
});

// #region Main handler
async function handler(req: PayloadRequest): Promise<PaginatedDocs<Request>> {
  const { payload, query, pathname } = req;

  const donationID = pathname
    .split('/')
    .filter((part) => !['donations', 'matched-requests'].includes(part))
    .pop();

  if (!donationID) {
    throw new ValidationError('Donation ID is required', {
      name: ValidationErrorNames.REQUIRED_FIELD_MISSING,
      statusCode: status.BAD_REQUEST,
      statusText: 'Bad Request',
    });
  }

  const criteria = parseMatchCritera(query.criteria);
  const { limit = 10, page = 0, ...searchParams } = getEndpointSearchParams(req);

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
// #endregion

// #region Helpers
function parseMatchCritera(input: unknown): MatchCriteria | undefined {
  if (input === undefined || input === null) {
    return undefined;
  }

  const parsed = matchCriteriaSchema.safeParse(input);

  if (parsed.data) {
    return parsed.data;
  }

  const error = z.flattenError(parsed.error);
  let errMsg: string | undefined;

  if (error.formErrors.length) {
    errMsg = error.formErrors[0];
  } else {
    for (const key of Object.keys(error.fieldErrors)) {
      type Key = keyof typeof error.fieldErrors;

      if (error.fieldErrors[key as Key]?.length) {
        errMsg = error.fieldErrors[key as Key]![0];
        break;
      }
    }
  }

  throw new ValidationError(errMsg || `Invalid search param 'options'.`, {
    name: ValidationErrorNames.INVALID_FORMAT,
    statusCode: status.UNPROCESSABLE_ENTITY,
    statusText: 'Unprocessable Entity',
  });
}
// #endregion
