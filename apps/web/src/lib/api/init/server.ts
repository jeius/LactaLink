import {
  API_URL,
  SESSION_NAME,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  VERCEL_BYPASS_TOKEN,
} from '@/lib/constants';
import { initServerApiClient } from '@lactalink/api';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function initServerApi() {
  const cookieStore = await cookies();

  const supabase = () =>
    createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
            console.warn('Error setting cookies:', error);
          }
        },
      },
      cookieOptions: {
        name: SESSION_NAME,
        httpOnly: true,
      },
    });

  initServerApiClient({
    apiUrl: API_URL,
    supabase,
    environment: 'nextjs',
    bypassToken: VERCEL_BYPASS_TOKEN,
  });
}
