import { AuthResult, SignInParams } from '@lactalink/types';
import { AuthError } from '@supabase/supabase-js';
import { getMeUser } from './getMeUser';

export async function signIn({
  email,
  password,
  supabase,
  apiUrl,
  vercelToken,
}: SignInParams): Promise<AuthResult> {
  const {
    data: { session },
    error,
  } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error };
  }

  if (!session) {
    return { error: new AuthError('No active session.') };
  }

  return await getMeUser(session.access_token, apiUrl, vercelToken);
}
