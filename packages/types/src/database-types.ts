import { Database } from './supabase-types';

type Tables = Database['public']['Tables'];

export type DBUser = Tables['users']['Row'];

export type DBMessage = Tables['messages']['Row'];

export type DBConversation = Tables['conversations']['Row'];

export type DBTransaction = Tables['transactions']['Row'];

export type DBDeliveryUpdates = Tables['delivery_updates']['Row'];
