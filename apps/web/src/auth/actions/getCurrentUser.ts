'use server';
import { getMeUser } from '@/lib/utils/meUser';
import { createClient } from '@/lib/utils/supabase/server';

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  const authResult = await getMeUser(session.access_token);

  if (authResult.user) {
    return { user: authResult.user, permissions: authResult.permissions };
  }

  return { user: null, permissions: null };
}
