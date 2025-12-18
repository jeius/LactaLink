import { Message } from '@lactalink/types/payload-generated-types';
import { RealtimeChannel } from '@supabase/supabase-js';

const MESSAGE_EVENT = 'new-message';

export function sendRealtimeMessage(channel: RealtimeChannel, message: Message) {
  channel.send({ type: 'broadcast', event: MESSAGE_EVENT, payload: message });
}

export function receiveRealtimeMessage(
  channel: RealtimeChannel,
  callback?: (message: Message) => void
) {
  channel.on<Message>('broadcast', { event: MESSAGE_EVENT }, ({ payload }) => {
    callback?.(payload);
  });
}
