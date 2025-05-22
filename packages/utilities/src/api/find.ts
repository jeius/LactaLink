import { ApiOptions, CollectionSlug, Config, FindByIDResult, FindResult } from '@lactalink/types';
import { stringify } from 'qs-esm';
import { apiFetch } from './apiFetch';

export async function findDocs<Slug extends CollectionSlug>(
  params: ApiOptions<Slug, 'FIND'>
): Promise<Config['collections'][Slug][]> {
  const { apiUrl, collection, token, vercelToken, ...searchParams } = params;
  const query = stringify(searchParams);

  if (!token) {
    throw new Error('Invalid session. User must sign in.');
  }

  const url = new URL(`/api/${collection}?${query}`, apiUrl);
  const res = await apiFetch<FindResult<Config['collections'][Slug]>>({
    token,
    vercelToken,
    url,
    method: 'GET',
  });

  if ('error' in res) {
    throw new Error(res.message);
  }

  return res.data.docs;
}

export async function findDocsWithPagination<Slug extends CollectionSlug>(
  params: ApiOptions<Slug, 'FIND'>
): Promise<FindResult<Config['collections'][Slug]>> {
  const { apiUrl, collection, token, vercelToken, ...searchParams } = params;
  const query = stringify(searchParams);

  if (!token) {
    throw new Error('Invalid session. User must sign in.');
  }

  const url = new URL(`/api/${collection}?${query}`, apiUrl);
  const res = await apiFetch<FindResult<Config['collections'][Slug]>>({
    token,
    vercelToken,
    url,
    method: 'GET',
  });

  if ('error' in res) {
    throw new Error(res.message);
  }

  return res.data;
}

export async function findDocById<Slug extends CollectionSlug>(
  id: Config['collections'][Slug]['id'],
  params: ApiOptions<Slug, 'FIND'>
): Promise<Config['collections'][Slug]> {
  const { apiUrl, collection, token, vercelToken, ...searchParams } = params;
  const query = stringify(searchParams);

  if (!token) {
    throw new Error('Invalid session. User must sign in.');
  }

  const url = new URL(`/api/${collection}/${id}?${query}`, apiUrl);
  const res = await apiFetch<FindByIDResult<Config['collections'][Slug]>>({
    token,
    vercelToken,
    url,
    method: 'GET',
  });

  if ('error' in res) {
    throw new Error(res.message);
  }

  return res.data;
}
