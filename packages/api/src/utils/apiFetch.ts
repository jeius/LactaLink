import type { ApiFetchArgs, ApiFetchResponse } from '@lactalink/types/api';
import type { CollectionSlug } from '@lactalink/types/payload-types';
import { extractErrorMessage, extractErrorStatus } from '@lactalink/utilities/extractors';

export async function apiFetch<T, Slug extends CollectionSlug = CollectionSlug>(
  args: ApiFetchArgs<Slug>
): Promise<ApiFetchResponse<T>> {
  const { token, method, url, bypassToken, headers: headersParams } = args;

  const defaultHeaders = new Headers({ 'Content-Type': 'application/json' });
  const headers = headersParams || defaultHeaders;

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (bypassToken) {
    headers.set('x-vercel-protection-bypass', bypassToken);
  }

  try {
    let body = undefined;

    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      body = args.body && (args.body instanceof FormData ? args.body : JSON.stringify(args.body));
    }

    const res = await fetch(url, { method, headers, body });

    if (!res.ok) {
      const data = (await res.json()) as { message?: string } | { errors: { message?: string[] } };
      throw new Error(extractErrorMessage('errors' in data ? data.errors : data));
    }

    const data = (await res.json()) as T;

    return { data, message: 'Api fetch successfull.', status: res.status };
  } catch (error) {
    return { message: extractErrorMessage(error), status: extractErrorStatus(error), error };
  }
}
