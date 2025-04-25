import { API_URL } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { AuthResult } from '@lactalink/types';
import { getMeUser } from '@lactalink/utilities';

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

  const { access_token: token } = session;

  return await getMeUser({ token, tokenType: 'Bearer', url: API_URL });
}
