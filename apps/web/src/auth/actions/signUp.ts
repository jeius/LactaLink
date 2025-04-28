'use server';

import { users } from '@/lib/db/drizzle-schema';
import { createClient } from '@/lib/utils/supabase/server';
import { User } from '@lactalink/types';
import { extractErrorMessage } from '@lactalink/utilities/errors';
import config from '@payload-config';
import { eq } from '@payloadcms/db-postgres/drizzle';
import { getPayload } from 'payload';

type Params = {
  email: string;
  password: string;
  role?: User['role'];
};
export async function signUp({ email, password, role = 'AUTHENTICATED' }: Params) {
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
    const [{ id }]: { id: string }[] = await payload.db.drizzle
      .update(users)
      .set({ role })
      .where(eq(users.authId, user.id))
      .returning({ id: users.id });

    const updatedUser = await payload.findByID({
      id,
      collection: 'users',
    });

    return { user: updatedUser, message: '🎉 Signed up successfully.' };
  } catch (error) {
    return { user: null, message: extractErrorMessage(error) };
  }
}
