'use server';

import { getServerSideURL } from '@/lib/utils/getURL';
import { createClient } from '@/lib/utils/supabase/server';
import { AuthResult } from '@lactalink/types/auth';
import {
  getAuth as GetAuth,
  signIn as SignIn,
  signOut as SignOut,
  signUp as SignUp,
} from '@lactalink/utilities';

const vercelToken = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const apiUrl = getServerSideURL();
const supabase = await createClient();

type Params = { email: string; password: string };

export async function signIn(params: Params) {
  return await SignIn({ ...params, supabase, apiUrl, vercelToken });
}

export async function signUp(params: Params) {
  return await SignUp({ ...params, supabase });
}

export async function signOut() {
  return await SignOut(supabase);
}

export async function getAuth() {
  return await GetAuth({ supabase, apiUrl, vercelToken });
}

export async function googleSignIn(): Promise<AuthResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getServerSideURL()}/auth/callback`,
    },
  });

  if (error) {
    return { error };
  }

  if (data?.url) {
    redirect(data.url);
  }
}
