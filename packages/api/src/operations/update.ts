import {
  BaseApiFetchArgs,
  CollectionBySlug,
  CollectionSlug,
  UpdateByIDArgs,
  UpdateByIDResult,
} from '@lactalink/types';
import { stringify } from 'qs-esm';
import { apiFetch } from '../apiFetch';

export async function updateDocByID<Slug extends CollectionSlug>(
  args: UpdateByIDArgs<Slug>,
  options: BaseApiFetchArgs
): Promise<CollectionBySlug<Slug>> {
  const { url: apiUrl, ...restOfFetchOptions } = options;

  const { collection, data, id, ...searchParams } = args;
  const query = stringify(searchParams);

  const url = new URL(`/api/${collection}/${id}?${query}`, apiUrl);
  const res = await apiFetch<UpdateByIDResult<CollectionBySlug<Slug>>>({
    ...restOfFetchOptions,
    url,
    method: 'PATCH',
    body: data,
  });

  if ('error' in res) {
    throw new Error(res.message);
  }

  return res.data.doc;
}
