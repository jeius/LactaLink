import { AuthResult, MeUser } from '@lactalink/types/auth';
import { AuthError } from '@supabase/supabase-js';
import { apiFetch } from '../apiFetch';

export async function getMeUser(
  token: string,
  apiUrl: string,
  vercelToken?: string
): Promise<AuthResult> {
  const url = new URL(`/api/users/me`, apiUrl);

  const res = await apiFetch<MeUser>({ url, token, bypassToken: vercelToken, method: 'GET' });

  if ('error' in res) {
    return { error: new AuthError(res.message, res.status) };
  }

  if (!res.data.user) {
    return { error: new AuthError(res.data.message) };
  }

  return { data: res.data };
}
