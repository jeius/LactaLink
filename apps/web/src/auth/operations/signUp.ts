'use server';

import { createClient } from '@/lib/utils/supabase/server';
import { User } from '@lactalink/types';
import { status } from 'http-status';
import { APIError } from 'payload';

type UserData = Pick<User, 'email' | 'password' | 'id'>;

export async function signUp(email: string, password: string): Promise<UserData> {
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

  return { id: user.id, email: user.email!, password };
}
