import { supabase } from '@/lib/supabase';
import { Transaction } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';

export function createTransactionChannel(transaction: string | Transaction) {
  const channelName = `transaction:${extractID(transaction)}`;
  const existingChannel = supabase.getChannels().find((ch) => ch.topic === channelName);
  return {
    channel: existingChannel ?? supabase.channel(channelName),
    isSubscribed: !!existingChannel,
  };
}
