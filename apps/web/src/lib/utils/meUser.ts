import { AuthResult } from '@lactalink/types';
import { apiFetch } from '@lactalink/utilities';
import { getServerSideURL } from './getURL';

export async function getMeUser(token: string): Promise<AuthResult> {
  const vercelToken = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  const url = new URL(`/api/users/me`, getServerSideURL());

  const res = await apiFetch<AuthResult>({ url, token, vercelToken });

  if ('error' in res) {
    return { user: null, message: res.message };
  }

  return res.data;
}
