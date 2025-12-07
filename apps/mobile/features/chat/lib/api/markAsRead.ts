import { getChatService } from '@/lib/services/chat';
import { getMeUser } from '@/lib/stores/meUserStore';
import { Message } from '@lactalink/types/payload-generated-types';
import { isEqualProfiles } from '@lactalink/utilities/checkers';

export function markAsRead(messages: Message[]) {
  const meUser = getMeUser();
  if (!meUser) throw new Error('User not logged in');

  const unreadMessages = messages.filter((m) => {
    if (isEqualProfiles(m.sender, meUser?.profile)) return false; // Own messages are always read
    const reads = m.reads?.docs || [];
    return reads.length === 0; // No reads means unread
  });

  const chatService = getChatService();
  const markAsReadPromises = unreadMessages.map((message) =>
    chatService.markMessageAsRead(message, meUser)
  );

  return Promise.all(markAsReadPromises);
}
