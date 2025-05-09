import type { SupabaseClient } from '@supabase/supabase-js';

export async function signOut(supabase: SupabaseClient) {
  await supabase.auth.signOut();
  return { user: null, message: 'Signed out successfully' };
}
