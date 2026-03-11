import { PayloadRequest, PopulateType, SelectType, Where } from 'payload';

/**
 * @deprecated Use `getQueryOptions` instead, which is more
 * flexible and can be used for both endpoint handlers and service methods.
 */
export function getEndpointSearchParams(req: PayloadRequest) {
  const { query } = req;
  return {
    page: query.page ? Number(query.page) : undefined,
    limit: query.limit ? Number(query.limit) : undefined,
    sort: query.sort ? (query.sort as string) : undefined,
    where: query.where ? (query.where as Where) : undefined,
    depth: query.depth ? Number(query.depth) : undefined,
    pagination: query.pagination ? Boolean(query.pagination) : undefined,
    populate: query.populate ? (query.populate as PopulateType) : undefined,
    select: query.select ? (query.select as SelectType) : undefined,
  };
}

/**
 * Parses and validates the 'options' search param from the request query.
 *
 * @param req - The `PayloadRequest` passed from the endpoint
 */
export function getQueryOptions(req: PayloadRequest) {
  const { query } = req;
  return {
    page: query.page ? Number(query.page) : undefined,
    limit: query.limit ? Number(query.limit) : undefined,
    sort: query.sort ? (query.sort as string) : undefined,
    where: query.where ? (query.where as Where) : undefined,
    depth: query.depth ? Number(query.depth) : undefined,
    pagination: query.pagination ? Boolean(query.pagination) : undefined,
    populate: query.populate ? (query.populate as PopulateType) : undefined,
    select: query.select ? (query.select as SelectType) : undefined,
  };
}
