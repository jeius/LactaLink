import { AuthParams, AuthResult } from '@lactalink/types';
import { AuthError } from '@supabase/supabase-js';
import { getMeUser } from './getMeUser';

export async function getAuth({ supabase, apiUrl, vercelToken }: AuthParams): Promise<AuthResult> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    return { error };
  }

  if (!session) {
    const message = 'No active session, user must sign in.';
    return { error: new AuthError(message) };
  }

  return await getMeUser(session!.access_token, apiUrl, vercelToken);
}
