'use server';

import { createClient } from '@/lib/utils/supabase/server';
import { APIError } from 'payload';

export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new APIError(error.message, error.status);
  }
}
