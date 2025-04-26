'use server';

import { getServerSideURL } from '@/lib/utils/getURL';
import { createClient } from '@/lib/utils/supabase/server';
import { status } from 'http-status';
import { redirect } from 'next/navigation';
import { APIError } from 'payload';

export async function signInWithSupabase(email: string, password: string) {
  const supabase = await createClient();

  const {
    error,
    data: { user },
  } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw new APIError(error.message, error.status, error);
  }

  if (!user) {
    throw new APIError('User not found from supabase.', status.NOT_FOUND);
  }

  return user;
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
