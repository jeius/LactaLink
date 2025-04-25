'use server';

import { createClient } from '@/lib/utils/supabase/server';
import { status } from 'http-status';
import { APIError } from 'payload';

export async function signUp(email: string, password: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new APIError(error.message, error.status, error);
  }

  if (!user) {
    throw new APIError('User not found from supabase.', status.NOT_FOUND);
  }

  return user;
}
