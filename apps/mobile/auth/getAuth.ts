import { getMeUser } from '@/lib/api/meUser';
import { supabase } from '@/lib/supabase';
import { AuthResult } from '@lactalink/types';

export async function getAuth(): Promise<AuthResult> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    return { user: null, message: error.message };
  }

  if (!session) {
    return { user: null, message: 'No active session, user must sign in.' };
  }

  return await getMeUser(session.access_token);
}
