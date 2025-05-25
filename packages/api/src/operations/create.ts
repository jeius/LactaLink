import {
  BaseApiFetchArgs,
  CollectionBySlug,
  CollectionSlug,
  CreateArgs,
  CreateResult,
  FileCollectionSlug,
} from '@lactalink/types';
import { stringify } from 'qs-esm';
import { apiFetch } from '../apiFetch';

export async function createDoc<Slug extends CollectionSlug>(
  args: CreateArgs<Slug>,
  options: BaseApiFetchArgs
): Promise<CollectionBySlug<Slug>> {
  const { url: apiUrl, ...restOfFetchOptions } = options;

  const { collection, data, ...searchParams } = args;
  const query = stringify(searchParams);

  const url = new URL(`/api/${collection}?${query}`, apiUrl);
  const res = await apiFetch<CreateResult<CollectionBySlug<Slug>>, Slug>({
    ...restOfFetchOptions,
    url,
    method: 'POST',
    body: data,
  });

  if ('error' in res) {
    throw new Error(res.message);
  }

  return res.data.doc;
}

export async function uploadFile<Slug extends FileCollectionSlug>(
  args: CreateArgs<Slug>,
  options: BaseApiFetchArgs
): Promise<CollectionBySlug<Slug>> {
  const { url: apiUrl, headers: headersParams, ...restOfFetchOptions } = options;
  const headers = new Headers(headersParams);
  headers.set('Content-Type', 'multipart/form-data');

  const { collection, data, ...searchParams } = args;
  const query = stringify(searchParams);

  const url = new URL(`/api/${collection}?${query}`, apiUrl);
  const res = await apiFetch<CreateResult<CollectionBySlug<Slug>>, Slug>({
    ...restOfFetchOptions,
    url,
    headers,
    method: 'POST',
    body: data,
  });

  if ('error' in res) {
    throw new Error(res.message);
  }

  return res.data.doc;
}
