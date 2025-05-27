import { SupabaseClient } from '@supabase/supabase-js';

export interface ApiClientConfig {
  apiUrl: string | URL;
  supabase: SupabaseClient;
  environment: 'nextjs' | 'expo';
  bypassToken?: string;
}
