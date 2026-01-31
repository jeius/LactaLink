import { getApiClient } from '@lactalink/api';
import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { UserProfile } from '@lactalink/types';
import { extractID } from '@lactalink/utilities/extractors';

const DEFAULT_PAGE_LIMIT = 10;
const DEFAULT_PAGE_NUMBER = 1;
const DEFAULT_DEPTH = 3;

export async function findPaginatedIncomingDonations(
  user: UserProfile,
  options: { page: number; limit: number }
) {
  const userID = extractID(user.value);
  const { page = DEFAULT_PAGE_NUMBER, limit = DEFAULT_PAGE_LIMIT } = options;

  return getApiClient().find({
    collection: 'donations',
    pagination: true,
    page,
    limit,
    depth: DEFAULT_DEPTH,
    where: {
      and: [
        { 'recipient.value': { equals: userID } },
        { 'recipient.relationTo': { equals: user.relationTo } },
        { status: { equals: DONATION_REQUEST_STATUS.PENDING.value } },
      ],
    },
  });
}

export async function findPaginatedIncomingRequests(
  user: UserProfile,
  options: { page: number; limit: number }
) {
  const userID = extractID(user.value);
  const { page = DEFAULT_PAGE_NUMBER, limit = DEFAULT_PAGE_LIMIT } = options;

  return getApiClient().find({
    collection: 'requests',
    pagination: true,
    page,
    limit,
    depth: DEFAULT_DEPTH,
    where: {
      and: [
        { 'recipient.value': { equals: userID } },
        { 'recipient.relationTo': { equals: user.relationTo } },
        { status: { equals: DONATION_REQUEST_STATUS.PENDING.value } },
      ],
    },
  });
}

export async function findDonation(id: string) {
  return getApiClient().findByID({
    collection: 'donations',
    id: id,
    depth: DEFAULT_DEPTH,
    joins: { transactions: { count: true, limit: 5 } },
  });
}

export async function findRequest(id: string) {
  return getApiClient().findByID({
    collection: 'requests',
    id: id,
    depth: DEFAULT_DEPTH,
    joins: { transactions: { count: true, limit: 5 } },
  });
}
