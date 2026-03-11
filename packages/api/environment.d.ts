import { Config } from '@/payload-types';

declare module 'payload' {
  export interface GeneratedTypes extends Config {}
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_URL?: string;
      NEXT_PUBLIC_SUPABASE_URL?: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
      ADMIN_EMAIL?: string;
      ADMIN_PASSWORD?: string;
      USER_EMAIL?: string;
      USER_PASSWORD?: string;
    }
  }
}
