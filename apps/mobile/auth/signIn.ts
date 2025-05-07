import { getMeUser } from '@/lib/api/meUser';
import { supabase } from '@/lib/supabase';
import { AuthResult } from '@lactalink/types';

type SignInParams = {
  email: string;
  password: string;
};

export async function signIn({ email, password }: SignInParams): Promise<AuthResult> {
  const {
    data: { session },
    error,
  } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { user: null, message: error.message };
  }

  if (!session) {
    return { user: null, message: 'No session found' };
  }

  return await getMeUser(session.access_token);
}
