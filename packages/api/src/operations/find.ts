import {
  BaseApiFetchArgs,
  CollectionBySlug,
  CollectionSlug,
  FindArgs,
  FindByIDArgs,
  FindResult,
} from '@lactalink/types';
import { stringify } from 'qs-esm';
import { apiFetch } from '../apiFetch';

export async function findDocs<Slug extends CollectionSlug, P extends boolean>(
  args: FindArgs<Slug, P>,
  options: BaseApiFetchArgs
): Promise<FindResult<Slug, P>> {
  const { url: apiUrl, ...restOfFetchOptions } = options;

  const { collection, pagination, page, ...searchParams } = args;
  let query = stringify(searchParams);

  if (pagination) {
    query = stringify({ ...searchParams, page });
  }

  const url = new URL(`/api/${collection}?${query}`, apiUrl);
  const res = await apiFetch<FindResult<Slug, P>>({
    ...restOfFetchOptions,
    url,
    method: 'GET',
  });

  if ('error' in res) {
    throw new Error(res.message);
  }

  return res.data;
}

export async function findDocById<Slug extends CollectionSlug>(
  args: FindByIDArgs<Slug>,
  options: BaseApiFetchArgs
): Promise<CollectionBySlug<Slug>> {
  const { url: apiUrl, ...restOfFetchOptions } = options;

  const { collection, id, ...searchParams } = args;
  const query = stringify(searchParams);

  const url = new URL(`/api/${collection}/${id}?${query}`, apiUrl);
  const res = await apiFetch<CollectionBySlug<Slug>>({
    ...restOfFetchOptions,
    url,
    method: 'GET',
  });

  if ('error' in res) {
    throw new Error(res.message);
  }

  return res.data;
}
