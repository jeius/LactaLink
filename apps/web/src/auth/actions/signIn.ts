'use server';

import { getServerSideURL } from '@/lib/utils/getURL';
import { createClient } from '@/lib/utils/supabase/server';
import { SignInSchema } from '@lactalink/types/forms';
import { getMeUser } from '@lactalink/utilities/getters';
import { redirect } from 'next/navigation';
import { APIError } from 'payload';

export async function signIn({ email, password }: SignInSchema) {
  const supabase = await createClient();

  const {
    error,
    data: { session },
  } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { user: null, message: error.message };
  }

  if (!session)
    return {
      user: null,
      message: 'No active session, user must be logged in.',
    };

  const { access_token } = session;

  const { user, message } = await getMeUser({
    token: access_token,
    url: getServerSideURL(),
  });

  return { user, message };
}

export async function googleSignIn() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getServerSideURL()}/auth/callback`,
    },
  });

  if (error) {
    throw new APIError(error.message, error.status, error);
  }

  if (data?.url) {
    redirect(data.url);
  }
}
