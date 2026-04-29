import {
  findNearestHospital,
  findNearestMilkbank,
} from '@/lib/db/drizzle/queryBuilders/findNearestOrganization';
import { createPayloadHandler } from '@/lib/utils/createPayloadHandler';
import { getQueryOptions } from '@/lib/utils/getEndpointSearchParams';
import { ValidationErrorNames } from '@lactalink/enums/error-names';
import {
  NearOrganizationsOptions,
  nearOrganizationsOptionsSchema,
} from '@lactalink/form-schemas/validators';
import { Hospital, MilkBank } from '@lactalink/types/payload-generated-types';
import { ValidationError } from '@lactalink/utilities/errors';
import { asc, lte, sql } from '@payloadcms/db-postgres/drizzle';
import httpStatus from 'http-status';
import { APIError, CollectionSlug, PaginatedDocs, Payload, PayloadRequest } from 'payload';

type Doc = Hospital | MilkBank;

export const nearOrganizationsHandler = createPayloadHandler({
  requireAdmin: false,
  handler: handler,
});

// #region Main handler
async function handler(req: PayloadRequest): Promise<PaginatedDocs<Doc>> {
  const { payload, query, pathname } = req;

  const parts = new Set(pathname.split('/'));
  const collection = parts.has('hospitals')
    ? 'hospitals'
    : parts.has('milkBanks')
      ? 'milkBanks'
      : null;

  if (!validateCollection(collection)) {
    throw new APIError(
      'Invalid collection. Expected "hospitals" or "milkBanks". Requested: ' + collection,
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
  collection: Extract<CollectionSlug, 'hospitals' | 'milkBanks'>,
  nearOptions: NearOrganizationsOptions,
  queryOptions: { limit: number; offset: number }
) {
  const { location, maxDistance } = nearOptions;
  const { limit, offset } = queryOptions;

  const fetch =
    collection === 'hospitals'
      ? payload.db.drizzle.$with('findNearestHospitals').as(findNearestHospital(location))
      : payload.db.drizzle.$with('findNearestMilkbanks').as(findNearestMilkbank(location));

  const filter = lte(fetch.distance, maxDistance);

  const [totalRowsResult, results] = await Promise.all([
    payload.db.drizzle
      .with(fetch)
      .select({ count: sql<number>`COUNT(${fetch.id})` })
      .from(fetch)
      .where(filter),
    payload.db.drizzle
      .with(fetch)
      .selectDistinctOn([fetch.id], {
        id: fetch.id,
        distance: fetch.distance,
      })
      .from(fetch)
      .where(filter)
      .orderBy(asc(fetch.id))
      .limit(limit)
      .offset(offset),
  ]);

  const totalRows = totalRowsResult[0]?.count || 0;
  return { results, totalRows };
}

function parseNearOptions(input: unknown): NearOrganizationsOptions {
  if (input === undefined || input === null) {
    throw new ValidationError(`Search param 'options' must be provided.`, {
      name: ValidationErrorNames.REQUIRED_FIELD_MISSING,
      statusCode: httpStatus.BAD_REQUEST,
      statusText: httpStatus[httpStatus.BAD_REQUEST],
    });
  }

  const parsed = nearOrganizationsOptionsSchema.safeParse(input);

  if (parsed.data) {
    return parsed.data;
  }

  const error = parsed.error.issues.pop();
  throw new ValidationError(error?.message ?? 'Invalid query parameters.', {
    name: ValidationErrorNames.INVALID_TYPE,
    statusCode: httpStatus.BAD_REQUEST,
    statusText: httpStatus[httpStatus.BAD_REQUEST],
  });
}

function validateCollection(collection: unknown): collection is 'hospitals' | 'milkBanks' {
  return collection === 'hospitals' || collection === 'milkBanks';
}
// #endregion
