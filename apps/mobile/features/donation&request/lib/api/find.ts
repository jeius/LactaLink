import { getApiClient } from '@lactalink/api';
import { DONATION_REQUEST_STATUS } from '@lactalink/enums';
import { UserProfile } from '@lactalink/types';
import type {
  CollectionSlug,
  FindOptions,
  SelectType,
  Where,
} from '@lactalink/types/payload-types';
import { extractID } from '@lactalink/utilities/extractors';

type PaginationOptions = Pick<FindOptions<CollectionSlug, SelectType>, 'page' | 'limit'>;

const DEFAULT_PAGE_LIMIT = 10;
const DEFAULT_PAGE_NUMBER = 1;
const DEFAULT_DEPTH = 3;

export async function findPaginatedIncomingDonations(
  user: UserProfile,
  options: PaginationOptions,
  init?: RequestInit
) {
  const userID = extractID(user.value);
  const { page = DEFAULT_PAGE_NUMBER, limit = DEFAULT_PAGE_LIMIT } = options;

  return getApiClient().find(
    {
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
    },
    init
  );
}

export async function findPaginatedIncomingRequests(
  user: UserProfile,
  options: PaginationOptions,
  init?: RequestInit
) {
  const userID = extractID(user.value);
  const { page = DEFAULT_PAGE_NUMBER, limit = DEFAULT_PAGE_LIMIT } = options;

  return getApiClient().find(
    {
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
    },
    init
  );
}

export async function findDonation(id: string, init?: RequestInit) {
  return getApiClient().findByID(
    {
      collection: 'donations',
      id: id,
      depth: DEFAULT_DEPTH,
      joins: { transactions: { count: true, limit: 5 } },
    },
    init
  );
}

export async function findRequest(id: string, init?: RequestInit) {
  return getApiClient().findByID(
    {
      collection: 'requests',
      id: id,
      depth: DEFAULT_DEPTH,
      joins: { transactions: { count: true, limit: 5 } },
    },
    init
  );
}

export async function findPaginatedMilkBagsByDonor(
  donorID: string,
  options: PaginationOptions & { draft?: boolean; trash?: boolean },
  init?: RequestInit
) {
  const { page = DEFAULT_PAGE_NUMBER, limit = DEFAULT_PAGE_LIMIT } = options;
  const filters: Where[] = [{ donor: { equals: donorID } }];
  if (options.trash) filters.push({ deletedAt: { exists: true } });
  return getApiClient().find(
    {
      collection: 'milkBags',
      draft: options.draft,
      trash: options.trash,
      page,
      limit,
      pagination: true,
      depth: DEFAULT_DEPTH,
      where: { and: filters },
    },
    init
  );
}
