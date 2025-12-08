import { supabase } from '@/lib/supabase';
import { Conversation } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';

export function createChatChannel(conversation: string | Conversation) {
  const conversationId = extractID(conversation);
  return supabase.channel(`chat-${conversationId}`);
}

export function createGeneralChatsChannel() {
  return supabase.channel('chats-general');
}
