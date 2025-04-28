'use server';

import { createClient } from '@/lib/utils/supabase/server';
import { User } from '@lactalink/types';
import { extractErrorMessage } from '@lactalink/utilities/errors';
import config from '@payload-config';
import { getPayload, ValidationError } from 'payload';

type Params = {
  email: string;
  password: string;
  role: User['role'];
};
export async function signUp({ email, password, role }: Params) {
  const supabase = await createClient();
  const payload = await getPayload({ config });

  const {
    error,
    data: { user },
  } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { user: null, message: error.message };
  }

  if (!user) {
    return { user: null, message: 'Unable to create admin, try again later.' };
  }

  // If identities are present, it means the user is created successfully
  // and we can set the user id in the data object to be saved in the database.
  // Otherwise, we can assume that the user is already created and we can skip this step.
  // This is a workaround to avoid creating duplicate users in the database.
  if (!user.identities?.length) {
    return { user: null, message: 'User already exist.' };
  }

  try {
    const admin = await payload.create({
      collection: 'users',
      data: { email, authId: user.id, role, createdVia: 'EMAIL_PASSWORD' },
      depth: 0,
    });

    return { user: admin, message: '🎉 Signed up successfully.' };
  } catch (error) {
    let msg = extractErrorMessage(error);

    const err = error as ValidationError;
    if (err) {
      const { path, message } = err.data.errors[0];
      if (path === 'email' && message.toLowerCase().includes('unique')) {
        msg = 'Email already taken.';
      }
    }

    return { user: null, message: msg };
  }
}
