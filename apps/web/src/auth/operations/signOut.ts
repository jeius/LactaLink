'use server';

import { createClient } from '@/lib/utils/supabase/server';

export async function signOut() {
  const supabase = await createClient();

  await supabase.auth.signOut();
}
