import { Database } from './supabase-types';

type Tables = Database['public']['Tables'];

export type DBUser = Tables['users']['Row'];

export type DBMessage = Tables['messages']['Row'];

export type DBConversation = Tables['conversations']['Row'];
