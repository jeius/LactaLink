'use server';

import { getServerSideURL } from '@/lib/utils/getURL';
import { createClient } from '@/lib/utils/supabase/server';
import { getAuth as GetAuth, signIn as SignIn, signOut as SignOut } from '@lactalink/utilities';
import { redirect } from 'next/navigation';

type Params = { email: string; password: string };

export async function signIn(params: Params) {
  const vercelToken = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  const apiUrl = getServerSideURL();
  const supabase = await createClient();
  return await SignIn({ ...params, supabase, apiUrl, vercelToken });
}

export async function signOut() {
  const supabase = await createClient();
  return await SignOut(supabase);
}

export async function getAuth() {
  const vercelToken = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  const apiUrl = getServerSideURL();
  const supabase = await createClient();
  return await GetAuth({ supabase, apiUrl, vercelToken });
}

export async function googleSignIn() {
  const supabase = await createClient();
  const auth = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getServerSideURL()}/auth/callback`,
    },
  });

  if (auth.error) {
    return { error: auth.error };
  }

  redirect(auth.data.url);
}
