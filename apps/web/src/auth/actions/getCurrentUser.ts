'use server';
import { getServerSideURL } from '@/lib/utils/getURL';
import { createClient } from '@/lib/utils/supabase/server';
import { getMeUser } from '@lactalink/utilities';

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  const { access_token } = session;

  const authResult = await getMeUser({
    token: access_token,
    url: getServerSideURL(),
  });

  if (authResult.user) {
    return { user: authResult.user, permissions: authResult.permissions };
  }

  return null;
}
