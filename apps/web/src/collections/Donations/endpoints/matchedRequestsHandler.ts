import { createPayloadHandler } from '@/lib/utils/createPayloadHandler';
import { getEndpointSearchParams } from '@/lib/utils/getEndpointSearchParams';
import { DONATION_REQUEST_STATUS, PREFERRED_STORAGE_TYPES } from '@lactalink/enums';
import { Request } from '@lactalink/types';
import { RequestMatchCriteria } from '@lactalink/types/collections';
import status from 'http-status';
import { APIError, PaginatedDocs, Where } from 'payload';

const STATUS = DONATION_REQUEST_STATUS;

export const matchedRequestsHandler = createPayloadHandler({
  requireAdmin: false,
  handler: async (req) => {
    const { payload, query, pathname } = req;

    const donationID = pathname
      .split('/')
      .filter((part) => !['donations', 'matched-requests'].includes(part))
      .pop();

    if (!donationID) {
      throw new APIError('Donation ID is required', status.BAD_REQUEST, null, true);
    }

    const donation = await payload.findByID({
      collection: 'donations',
      id: donationID,
      req,
      populate: {
        'delivery-preferences': { availableDays: true, address: true, preferredMode: true },
        addresses: { coordinates: true },
      },
    });

    const criteria = query.criteria as RequestMatchCriteria | undefined;

    // Build query conditions
    const whereConditions: Where[] = [{ status: { equals: STATUS.AVAILABLE.value } }];

    // Filter by minimum volume if needed
    const maxVolume = criteria?.maxVolume || donation.remainingVolume;
    if (maxVolume) {
      whereConditions.push({
        volumeNeeded: {
          less_than_equal: maxVolume,
        },
      });
    }

    // Filter by storage type
    const eitherType = PREFERRED_STORAGE_TYPES.EITHER.value;
    const storageType = criteria?.storageType || donation.details.storageType;
    if (storageType !== eitherType) {
      whereConditions.push({
        'details.preferredStorage': { in: [storageType, eitherType] },
      });
    } else {
      whereConditions.push({
        'details.preferredStorage': { equals: storageType },
      });
    }

    // Exclude specific requests
    if (criteria?.excludeRequestIds?.length) {
      whereConditions.push({
        id: { not_in: criteria.excludeRequestIds },
      });
    }

    // Filter by requester
    if (criteria?.requesterId) {
      whereConditions.push({
        donor: { equals: criteria.requesterId },
      });
    }

    // Exclude specific requesters
    if (criteria?.excludeRequesterIds?.length) {
      whereConditions.push({
        donor: { not_in: criteria.excludeRequesterIds },
      });
    }

    const searchParams = getEndpointSearchParams(req);

    let result: PaginatedDocs<Request>;
    let numberOfDocs = 0;
    let page = searchParams.page || 0;
    const limit = searchParams.limit || 10;

    while (numberOfDocs < limit) {
      const res = await payload.find({
        collection: 'requests',
        ...searchParams,
        limit,
        page,
        where: {
          and: [...whereConditions, searchParams.where || {}],
        },
        req,
      });

      const docs = res.docs;
      page += 1;

      if (!docs.length) break;

      numberOfDocs += res.docs.length;
      result = res;

      // If we have enough documents, break
      if (numberOfDocs >= (limit || 100) || docs.length >= numberOfDocs) {
        break;
      }

      // Update searchParams to skip already fetched documents
      searchParams.skip = finalDocs.length;
    }

    return { ...result };
  },
});
