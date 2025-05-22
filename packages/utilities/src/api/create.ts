import { ApiOptions, CollectionSlug, Config, CreateResult, HasUploadSlug } from '@lactalink/types';
import { stringify } from 'qs-esm';
import { apiFetch } from './apiFetch';

export async function createDoc<Slug extends CollectionSlug>(
  params: ApiOptions<Slug, 'CREATE'>
): Promise<Config['collections'][Slug]> {
  const { apiUrl, collection, token, vercelToken, data, ...searchParams } = params;
  const query = stringify(searchParams);

  if (!token) {
    throw new Error('Invalid session. User must sign in.');
  }

  const url = new URL(`/api/${collection}?${query}`, apiUrl);
  const res = await apiFetch<CreateResult<Config['collections'][Slug]>>({
    token,
    vercelToken,
    url,
    method: 'POST',
    body: data,
  });

  if ('error' in res) {
    throw new Error(res.message);
  }

  return res.data.doc;
}

type UploadFileParams<T extends CollectionSlug> = Omit<ApiOptions<T, 'CREATE'>, 'data'> & {
  data: FormData;
};

export async function uploadFile<Slug extends HasUploadSlug>(
  params: UploadFileParams<Slug>
): Promise<Config['collections'][Slug]> {
  const { apiUrl, collection, token, vercelToken, data, ...searchParams } = params;
  const query = stringify(searchParams);

  if (!token) {
    throw new Error('Invalid session. User must sign in.');
  }

  const url = new URL(`/api/${collection}?${query}`, apiUrl);
  const res = await apiFetch<CreateResult<Config['collections'][Slug]>>({
    token,
    vercelToken,
    url,
    method: 'POST',
    body: data,
    headers: new Headers({ 'Content-Type': 'multipart/form-data' }),
  });

  if ('error' in res) {
    throw new Error(res.message);
  }

  return res.data.doc;
}
