'use server';

import { users } from '@/lib/db/drizzle-schema';
import { createClient } from '@/lib/utils/supabase/server';
import { User } from '@lactalink/types';
import { SignUpSchema } from '@lactalink/types/forms';
import { extractErrorMessage } from '@lactalink/utilities/errors';
import config from '@payload-config';
import { eq, sql } from '@payloadcms/db-postgres/drizzle';
import { getPayload } from 'payload';

type Params = SignUpSchema & {
  role?: User['role'];
};
export async function signUp({ email, password, role = 'AUTHENTICATED' }: Params) {
  const supabase = await createClient();
  const payload = await getPayload({ config });

  const auth = await supabase.auth.signUp({ email, password });

  if (auth.error) {
    return { user: null, message: auth.error.message };
  }

  const user = auth.data.user;

  if (!user) {
    return { user: null, message: 'Unable to create admin, try again later.' };
  }

  try {
    const [{ id }]: { id: string }[] = await payload.db.drizzle
      .update(users)
      .set({ role, updatedAt: sql`NOW()` })
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
