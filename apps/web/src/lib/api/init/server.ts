import {
  SESSION_NAME,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  VERCEL_BYPASS_TOKEN,
} from '@/lib/constants';
import { getServerSideURL } from '@/lib/utils/getURL';
import { initServerApiClient } from '@lactalink/api';
import { createServerClient } from '@supabase/ssr';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { cookies } from 'next/headers';

export async function initServerApi() {
  const cookieStore = await cookies();
  const supabase = () => createSupabaseServerClient(cookieStore);

  initServerApiClient({
    apiUrl: getServerSideURL(),
    supabase,
    environment: 'nextjs',
    bypassToken: VERCEL_BYPASS_TOKEN,
  });
}

export function createSupabaseServerClient(cookieStore: ReadonlyRequestCookies) {
  if (globalThis.window !== undefined) {
    throw new Error('createSupabaseServerClient should not be called on the client-side');
  }

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch (error) {
          console.warn('Error setting cookies in while creating supabase server client:', error);
        }
      },
    },
    cookieOptions: {
      name: SESSION_NAME,
      httpOnly: true,
    },
  });
}
