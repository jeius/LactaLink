import { ApiOptions, Collections, CreateResult, HasUploadCollection } from '@lactalink/types';
import { stringify } from 'qs-esm';
import { apiFetch } from './apiFetch';

export async function createDoc<Collection extends Collections>(
  params: ApiOptions<Collection, 'CREATE'>
): Promise<Collection> {
  const { apiUrl, collection, token, vercelToken, data, ...searchParams } = params;
  const query = stringify(searchParams);

  if (!token) {
    throw new Error('Invalid session. User must sign in.');
  }

  const url = new URL(`/api/${collection}?${query}`, apiUrl);
  const res = await apiFetch<CreateResult<Collection>>({
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

export async function uploadFile<Collection extends HasUploadCollection<Collections>>(
  params: Omit<ApiOptions<Collection, 'CREATE'>, 'data'> & { data: FormData }
): Promise<Collection> {
  const { apiUrl, collection, token, vercelToken, data, ...searchParams } = params;
  const query = stringify(searchParams);

  if (!token) {
    throw new Error('Invalid session. User must sign in.');
  }

  const url = new URL(`/api/${collection}?${query}`, apiUrl);
  const res = await apiFetch<CreateResult<Collection>>({
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
