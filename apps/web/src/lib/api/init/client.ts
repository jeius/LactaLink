'use client';

import {
  SESSION_NAME,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  VERCEL_BYPASS_TOKEN,
} from '@/lib/constants';
import { getClientSideURL } from '@/lib/utils/getURL';
import { initApiClient } from '@lactalink/api';
import { createBrowserClient } from '@supabase/ssr';

export function initClientApi() {
  initApiClient({
    apiUrl: getClientSideURL(),
    supabase: createSupabaseClient,
    environment: 'nextjs',
    bypassToken: VERCEL_BYPASS_TOKEN,
  });
}

export function createSupabaseClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookieOptions: {
      name: SESSION_NAME,
    },
  });
}
