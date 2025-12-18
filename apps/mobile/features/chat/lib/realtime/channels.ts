import { supabase } from '@/lib/supabase';
import { Conversation } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';

export function createChatChannel(conversation: string | Conversation) {
  const conversationId = extractID(conversation);
  const channelName = `chat:${conversationId}`;
  const existingChannel = supabase.getChannels().find((ch) => ch.topic === channelName);
  return {
    isSubscribed: !!existingChannel,
    channel: existingChannel ?? supabase.channel(channelName),
  };
}

export function createGeneralChatsChannel() {
  const channelName = `chats:general`;
  const existingChannel = supabase.getChannels().find((ch) => ch.topic === channelName);
  return {
    isSubscribed: !!existingChannel,
    channel: existingChannel ?? supabase.channel(channelName),
  };
}
