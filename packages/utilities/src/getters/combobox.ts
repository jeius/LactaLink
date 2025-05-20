import {
  Collections,
  CollectionSlug,
  FindResult,
  HasNameCollection,
  Where,
} from '@lactalink/types';
import { stringify } from 'qs-esm';
import { apiFetch } from '../api/apiFetch';

type Options = {
  collection: CollectionSlug;
  token?: string | null;
  apiUrl: string;
  vercelToken?: string;
  limit?: number;
  where?: Where;
};

export async function comboBoxFetcher<TResult extends HasNameCollection<Collections>>(
  search: string,
  page: number,
  options: Options
) {
  const { token, collection, vercelToken, apiUrl, limit, where: whereParam } = options;

  if (!token) {
    throw new Error('Invalid session. User must sign in.');
  }

  const searchQuery: Where = { name: { contains: search.toLowerCase() } };
  const where: Where = whereParam ? { and: [searchQuery, whereParam] } : searchQuery;
  const query = stringify({
    where,
    page,
    limit: limit || 10,
    select: { name: true },
    depth: 0,
    sort: 'name',
  });

  const url = new URL(`/api/${collection}?${query}`, apiUrl);
  const res = await apiFetch<FindResult<TResult>>({
    method: 'GET',
    url,
    token,
    vercelToken,
  });

  if ('error' in res) {
    throw new Error(res.message);
  }

  return res.data;
}
