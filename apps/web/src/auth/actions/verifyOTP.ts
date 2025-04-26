'use server';

import { getServerSideURL } from '@/lib/utils/getURL';
import { createClient } from '@/lib/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getCurrentUser } from './getCurrentUser';

export async function verifySignup(otp: string) {
  const { user } = (await getCurrentUser()) ?? {};

  if (!user) {
    redirect(`${getServerSideURL()}/auth/sign-in`);
  }

  const supabase = await createClient();
  return await supabase.auth.verifyOtp({ email: user.email, token: otp, type: 'signup' });
}
