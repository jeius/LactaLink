'use server';
import { getServerSideURL } from '@/lib/utils/getURL';
import { getMeUser } from '@lactalink/utilities';
import config from '@payload-config';
import { cookies } from 'next/headers';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const cookieName = (await config).cookiePrefix + '-token';
  const token = cookieStore.get(cookieName)?.value;

  if (!token) {
    return null;
  }

  const authResult = await getMeUser({
    token,
    tokenType: 'JWT',
    url: getServerSideURL(),
    collection: 'users',
  });

  if (authResult.user) {
    return { user: authResult.user, permissions: authResult.permissions };
  }

  return null;
}
