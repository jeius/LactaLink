import { PayloadRequest, PopulateType, SelectType, Where } from 'payload';

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
