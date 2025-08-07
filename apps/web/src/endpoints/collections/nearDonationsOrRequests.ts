import { findNearestDonations, findNearestRequests } from '@/lib/db/drizzle/queryBuilders';
import { createPayloadHandler } from '@/lib/utils/createPayloadHandler';
import { getEndpointSearchParams } from '@/lib/utils/getEndpointSearchParams';
import { Donation, NearOptions, Point } from '@lactalink/types';
import { and, asc, eq, lte, sql } from '@payloadcms/db-postgres/drizzle';
import { APIError } from 'payload';

function validateLocation(location: unknown): Point {
  if (!Array.isArray(location) || location.length !== 2) {
    throw new Error(
      'Invalid point format. Expected an array with two elements [longitude, latitude].'
    );
  }

  const [longitude, latitude] = location;

  if (Number.isNaN(longitude) || Number.isNaN(latitude)) {
    throw new Error('Invalid point coordinates. Both longitude and latitude must be numbers.');
  }

  if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
    throw new Error(
      'Point coordinates out of bounds. Longitude must be between -180 and 180, latitude between -90 and 90.'
    );
  }

  // Return the validated point
  return [longitude, latitude];
}

function validateOptions(options: unknown): NearOptions {
  if (options === undefined || options === null) {
    throw new Error('Near Options must be provided.');
  }

  if (typeof options !== 'object') {
    throw new Error('Options must be an object.');
  }

  const { location, status, maxDistance } = options as NearOptions;

  if (status && typeof status !== 'string') {
    throw new Error('Status must be a string.');
  }

  if (maxDistance && Number.isNaN(Number(maxDistance))) {
    throw new Error('Max distance must be a valid number.');
  }

  return { location: validateLocation(location), status, maxDistance };
}

export const nearDonationsOrRequestsHandler = createPayloadHandler({
  requireAdmin: false,
  handler: async (req) => {
    const { payload, query, pathname } = req;

    const parts = new Set(pathname.split('/'));
    const collection = parts.has('donations')
      ? 'donations'
      : parts.has('requests')
        ? 'requests'
        : null;

    if (!collection) {
      throw new APIError(
        'Invalid collection. Expected "donations" or "requests". Requested: ' + collection,
        400,
        null,
        true
      );
    }

    const { location, maxDistance, status } = validateOptions(query.options);
    const { limit = 10, page = 1, ...searchParams } = getEndpointSearchParams(req);

    const offset = searchParams.pagination ? Math.max(0, page - 1) * limit : 0;

    async function find() {
      if (collection === 'donations') {
        const fetch = payload.db.drizzle
          .$with('findNearestDonations')
          .as(findNearestDonations(location));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any[] = [];

        if (status) {
          where.push(eq(fetch.status, status));
        }

        if (maxDistance) {
          where.push(lte(fetch.distance, maxDistance));
        }

        const totalRowsResult = await payload.db.drizzle
          .with(fetch)
          .select({ count: sql<number>`COUNT(${fetch.id})` })
          .from(fetch)
          .where(and(...where));
        const totalRows = totalRowsResult[0]?.count ?? 0;

        const results = await payload.db.drizzle
          .with(fetch)
          .selectDistinctOn([fetch.id], {
            id: fetch.id,
            distance: fetch.distance,
          })
          .from(fetch)
          .where(and(...where))
          .orderBy(asc(fetch.id))
          .limit(limit)
          .offset(offset);

        return { results, totalRows };
      } else if (collection === 'requests') {
        const fetch = payload.db.drizzle
          .$with('findNearestRequests')
          .as(findNearestRequests(location));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any[] = [];

        if (status) {
          where.push(eq(fetch.status, status));
        }

        if (maxDistance) {
          where.push(lte(fetch.distance, maxDistance));
        }

        const totalRowsResult = await payload.db.drizzle
          .with(fetch)
          .select({ count: sql<number>`COUNT(${fetch.id})` })
          .from(fetch)
          .where(and(...where));
        const totalRows = totalRowsResult[0]?.count ?? 0;

        const results = await payload.db.drizzle
          .with(fetch)
          .selectDistinctOn([fetch.id], {
            id: fetch.id,
            distance: fetch.distance,
          })
          .from(fetch)
          .where(and(...where))
          .orderBy(asc(fetch.id))
          .limit(limit)
          .offset(offset);

        return { results, totalRows };
      }
      throw new Error(`Unsupported collection: ${collection}`);
    }

    const { results, totalRows } = await find();

    const { docs } = await payload.find({
      ...searchParams,
      collection: collection,
      pagination: false,
      req,
      where: {
        and: [{ ...searchParams.where }, { id: { in: results.map((r) => r.id) } }],
      },
    });

    const sortedDocs: (Request | Donation)[] = [];
    const mappedDocs = new Map<string, Request | Donation>();

    for (const doc of docs) {
      mappedDocs.set(doc.id, doc as Request | Donation);
    }

    for (const res of results) {
      const doc = mappedDocs.get(res.id);
      if (doc) {
        sortedDocs.push(doc);
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
