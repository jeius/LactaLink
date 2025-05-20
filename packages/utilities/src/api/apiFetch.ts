import { APIParams, APIResponse } from '@lactalink/types';
import { extractErrorMessage, extractErrorStatus } from '../errors';

export async function apiFetch<T>({
  token,
  method = 'GET',
  url,
  vercelToken,
  body: bodyParams,
  headers = new Headers({ 'Content-Type': 'application/json' }),
}: APIParams): Promise<APIResponse<T>> {
  try {
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }

    if (vercelToken) {
      headers.append('x-vercel-protection-bypass', vercelToken);
    }

    const body =
      bodyParams && (bodyParams instanceof FormData ? bodyParams : JSON.stringify(bodyParams));

    const res = await fetch(url, { method, headers, body });

    if (!res.ok) {
      const data = (await res.json()) as { message?: string };
      throw new Error(data.message || 'Unknown error occured while fetching from api.');
    }

    const data = (await res.json()) as T;

    return { data, message: 'Api fetch successfull.', status: res.status };
  } catch (error) {
    return { message: extractErrorMessage(error), status: extractErrorStatus(error), error };
  }
}
