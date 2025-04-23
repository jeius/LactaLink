'use server';

import { getServerSideURL } from '@/lib/utils/getURL';
import { createClient } from '@/lib/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function googleSignIn() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getServerSideURL()}/auth/callback`,
    },
  });
  if (error) {
    console.log(error.message, error.cause);
    return error.message;
  }
  if (data?.url) {
    redirect(data.url);
  }
}
