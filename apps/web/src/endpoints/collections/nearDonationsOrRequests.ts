import { findNearestDonations, findNearestRequests } from '@/lib/db/drizzle/queryBuilders';
import { createPayloadHandler } from '@/lib/utils/createPayloadHandler';
import { getQueryOptions } from '@/lib/utils/getEndpointSearchParams';
import { ValidationErrorNames } from '@lactalink/enums/error-names';
import {
  NearDonationOrRequestOptions,
  nearDonationRequestSchema,
} from '@lactalink/form-schemas/validators';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { ValidationError } from '@lactalink/utilities/errors';
import { and, asc, eq, lte, sql, SQLWrapper } from '@payloadcms/db-postgres/drizzle';
import httpStatus from 'http-status';
import { APIError, CollectionSlug, PaginatedDocs, Payload, PayloadRequest } from 'payload';
import { isNumber } from 'payload/shared';
import z from 'zod';

export const nearDonationsOrRequestsHandler = createPayloadHandler({
  requireAdmin: false,
  handler: handler,
});

// #region Main handler
async function handler(req: PayloadRequest): Promise<PaginatedDocs<Donation | Request>> {
  const { payload, query, pathname } = req;

  const parts = new Set(pathname.split('/'));
  const collection = parts.has('donations')
    ? 'donations'
    : parts.has('requests')
      ? 'requests'
      : null;

  if (!validateCollection(collection)) {
    throw new APIError(
      'Invalid collection. Expected "donations" or "requests". Requested: ' + collection,
      httpStatus.BAD_REQUEST,
      null,
      true
    );
  }

  const nearOptions = parseNearOptions(query.options);
  const { limit = 10, page = 1, ...queryOptions } = getQueryOptions(req);

  const offset = queryOptions.pagination ? Math.max(0, page - 1) * limit : 0;

  const { results, totalRows } = await find(payload, collection, nearOptions, {
    offset,
    limit,
  });

  type Doc = Request | Donation;

  let docs: Doc[] = [];

  if (results.length) {
    const findResults = await payload.find({
      ...queryOptions,
      collection: collection,
      pagination: false,
      req,
      where: {
        and: [{ ...queryOptions.where }, { id: { in: results.map((r) => r.id) } }],
      },
    });
    docs = findResults.docs;
  }

  // Since the 'docs' are not guaranteed to be in the same order as 'results', we need to sort them
  // according to the order of 'results'.
  const sortedDocs: Doc[] = [];

  // Create a map of docs for quick lookup
  const mappedDocs = new Map<Doc['id'], Doc>();
  for (const doc of docs) {
    mappedDocs.set(doc.id, doc);
  }

  // Iterate over results and push the corresponding doc to sortedDocs
  for (const res of results) {
    const doc = mappedDocs.get(res.id);
    if (doc) {
      sortedDocs.push(doc);
    }
  }

  // Return paginated response
  return {
    docs: sortedDocs,
    totalDocs: totalRows,
    totalPages: Math.ceil(totalRows / limit),
    page: queryOptions.pagination ? page : 1,
    limit,
    nextPage: queryOptions.pagination && (page + 1) * limit < totalRows ? page + 1 : null,
    prevPage: queryOptions.pagination && page > 0 ? page - 1 : null,
    hasNextPage: queryOptions.pagination ? (page + 1) * limit < totalRows : false,
    hasPrevPage: Boolean(queryOptions.pagination) && page > 0,
    pagingCounter: queryOptions.pagination ? page * limit + 1 : 1,
  };
}
// #endregion

// #region Helpers
async function find(
  payload: Payload,
  collection: Extract<CollectionSlug, 'donations' | 'requests'>,
  nearOptions: NearDonationOrRequestOptions,
  queryOptions: { limit: number; offset: number }
) {
  const { location, maxDistance, status } = nearOptions;
  const { limit, offset } = queryOptions;

  const fetch =
    collection === 'donations'
      ? payload.db.drizzle.$with('findNearestDonations').as(findNearestDonations(location))
      : payload.db.drizzle.$with('findNearestRequests').as(findNearestRequests(location));

  const where: SQLWrapper[] = [];

  if (status) {
    where.push(eq(fetch.status, status));
  }

  if (maxDistance) {
    where.push(lte(fetch.distance, maxDistance));
  }

  const [totalRowsResult, results] = await Promise.all([
    payload.db.drizzle
      .with(fetch)
      .select({ count: sql<number>`COUNT(${fetch.id})` })
      .from(fetch)
      .where(and(...where)),
    payload.db.drizzle
      .with(fetch)
      .selectDistinctOn([fetch.id], {
        id: fetch.id,
        distance: fetch.distance,
      })
      .from(fetch)
      .where(and(...where))
      .orderBy(asc(fetch.id))
      .limit(limit)
      .offset(offset),
  ]);

  const totalRows = totalRowsResult[0]?.count || 0;
  return { results, totalRows };
}

function parseNearOptions(input: unknown): NearDonationOrRequestOptions {
  if (input === undefined || input === null) {
    throw new ValidationError(`Search param 'options' must be provided.`, {
      name: ValidationErrorNames.REQUIRED_FIELD_MISSING,
      statusCode: httpStatus.BAD_REQUEST,
      statusText: httpStatus[httpStatus.BAD_REQUEST],
    });
  }

  // Convert to number the stringified coordinates
  if (typeof input === 'object' && 'location' in input && Array.isArray(input.location)) {
    input.location = input.location.map((coord) => Number(coord));
  }

  // Convert to number the stringified maxDistance
  if (typeof input === 'object' && 'maxDistance' in input) {
    const maxDistance = Number(input.maxDistance);
    if (isNumber(maxDistance)) input.maxDistance = maxDistance;
  }

  const parsed = nearDonationRequestSchema.safeParse(input);

  if (parsed.data) {
    return parsed.data;
  }

  const error = z.flattenError(parsed.error);
  let errMsg = `Invalid search param 'options'.`;

  if (error.formErrors.length) {
    errMsg = error.formErrors[0]!;
  } else {
    for (const key of Object.keys(error.fieldErrors)) {
      type Key = keyof typeof error.fieldErrors;

      if (error.fieldErrors[key as Key]?.length) {
        errMsg = error.fieldErrors[key as Key]![0]!;
        break;
      }
    }
  }

  throw new ValidationError(errMsg, {
    name: ValidationErrorNames.INVALID_FORMAT,
    statusCode: httpStatus.UNPROCESSABLE_ENTITY,
    statusText: httpStatus[httpStatus.UNPROCESSABLE_ENTITY],
  });
}

function validateCollection(collection: unknown): collection is 'donations' | 'requests' {
  return collection === 'donations' || collection === 'requests';
}
// #endregion
