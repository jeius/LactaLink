import { supabase } from '@/lib/supabase';
import { AuthResult } from '@lactalink/types';

export async function signOut(): Promise<AuthResult> {
  await supabase.auth.signOut();
  return { user: null, message: 'Signed out successfully' };
}
