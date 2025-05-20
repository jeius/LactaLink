import { ApiOptions, Collections, UpdateResult } from '@lactalink/types';
import { stringify } from 'qs-esm';
import { apiFetch } from './apiFetch';

export async function updateDocByID<Collection extends Collections>(
  id: Collection['id'],
  options: ApiOptions<Collection, 'UPDATE'>
): Promise<Collection> {
  const { apiUrl, collection, token, vercelToken, data, ...searchParams } = options;
  const query = stringify(searchParams);

  if (!token) {
    throw new Error('Invalid session. User must sign in.');
  }

  const url = new URL(`/api/${collection}/${id}?${query}`, apiUrl);
  const res = await apiFetch<UpdateResult<Collection>>({
    token,
    vercelToken,
    url,
    method: 'PATCH',
    body: data,
  });

  if ('error' in res) {
    throw new Error(res.message);
  }

  return res.data.doc;
}
