import { getApiClient } from '@lactalink/api';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { JoinQuery } from '@lactalink/types/payload-types';

const DELIVERY_PLANS_PAGE_LIMIT = 1;
const DEFAULT_JOIN_QUERY: JoinQuery<'transactions'> = {
  deliveryDetails: { count: true },
  deliveryUpdates: { count: true },
  deliveryPlans: { count: true, limit: DELIVERY_PLANS_PAGE_LIMIT, sort: '-updatedAt' },
  'tracking.reads': { count: true, limit: 2 },
  'tracking.statusHistory': false,
};

export function fetchTransaction(transactionID: string) {
  return getApiClient().findByID({
    collection: 'transactions',
    id: transactionID,
    depth: 3,
    joins: DEFAULT_JOIN_QUERY,
  });
}

export function fetchPaginatedTransactions(
  page: number,
  options?: { status?: Transaction['status']; limit?: number; depth?: number }
) {
  const { status, limit = 10, depth = 3 } = options ?? {};
  return getApiClient().find({
    collection: 'transactions',
    pagination: true,
    page: page,
    limit: limit,
    where: status ? { status: { equals: status } } : undefined,
    depth: depth,
    joins: DEFAULT_JOIN_QUERY,
  });
}

export function fetchPaginatedDeliveryPlans(transactionID: string, page: number) {
  return getApiClient().find({
    collection: 'delivery-details',
    where: { transaction: { equals: transactionID } },
    pagination: true,
    page,
    limit: DELIVERY_PLANS_PAGE_LIMIT,
  });
}

export function fetchDeliveryDetail(deliveryDetailID: string) {
  return getApiClient().findByID({
    collection: 'delivery-details',
    id: deliveryDetailID,
    depth: 3,
  });
}
