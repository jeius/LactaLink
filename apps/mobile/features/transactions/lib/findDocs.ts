import { getApiClient } from '@lactalink/api';
import { Transaction } from '@lactalink/types/payload-generated-types';

export function fetchTransaction(transactionID: string) {
  return getApiClient().findByID({
    collection: 'transactions',
    id: transactionID,
    depth: 3,
    joins: {
      deliveryDetails: { count: true, limit: 0 },
      deliveryUpdates: { count: true, limit: 0 },
      deliveryPlans: { count: true, limit: 5, sort: '-createdAt' },
      'tracking.reads': { count: true, limit: 0 },
      'tracking.statusHistory': false,
    },
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
    joins: {
      deliveryDetails: { count: true, limit: 0 },
      deliveryUpdates: { count: true, limit: 0 },
      deliveryPlans: { count: true, limit: 5, sort: '-createdAt' },
      'tracking.reads': { count: true, limit: 0 },
      'tracking.statusHistory': false,
    },
  });
}
