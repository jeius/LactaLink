import { AuthResult } from '@lactalink/types';
import { apiFetch } from '@lactalink/utilities';
import { API_URL, VERCEL_BYPASS_TOKEN } from '../constants';

export async function getMeUser(token: string): Promise<AuthResult> {
  const vercelToken = VERCEL_BYPASS_TOKEN;
  const url = new URL(`/api/users/me`, API_URL);

  const res = await apiFetch<AuthResult>({ url, token, vercelToken });

  if ('error' in res) {
    return { user: null, message: res.message };
  }

  return res.data;
}
