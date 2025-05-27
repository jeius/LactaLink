'use client';

import {
  API_URL,
  SESSION_NAME,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  VERCEL_BYPASS_TOKEN,
} from '@/lib/constants';
import { initApiClient } from '@lactalink/api';
import { createBrowserClient } from '@supabase/ssr';

export function initClientApi() {
  const supabase = () =>
    createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookieOptions: {
        name: SESSION_NAME,
      },
    });

  initApiClient({
    apiUrl: API_URL,
    supabase,
    environment: 'nextjs',
    bypassToken: VERCEL_BYPASS_TOKEN,
  });
}
