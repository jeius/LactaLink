import {
  ApiOptions,
  Collections,
  CollectionSlug,
  Config,
  UpdateByIDResult,
} from '@lactalink/types';
import { stringify } from 'qs-esm';
import { apiFetch } from './apiFetch';

export async function updateDocByID<Slug extends CollectionSlug>(
  id: Collections['id'],
  options: ApiOptions<Slug, 'UPDATE'>
): Promise<Config['collections'][Slug]> {
  const { apiUrl, collection, token, vercelToken, data, ...searchParams } = options;
  const query = stringify(searchParams);

  if (!token) {
    throw new Error('Invalid session. User must sign in.');
  }

  const url = new URL(`/api/${collection}/${id}?${query}`, apiUrl);
  const res = await apiFetch<UpdateByIDResult<Config['collections'][Slug]>>({
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
