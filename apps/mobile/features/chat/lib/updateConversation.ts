import { Conversation, Message } from '@lactalink/types/payload-generated-types';
import { extractID } from '@lactalink/utilities/extractors';
import { produce } from 'immer';

export function addNewMessageInConversation(conversation: Conversation, newMessage: Message) {
  return produce(conversation, (draft) => {
    draft.lastMessageAt = newMessage.createdAt;

    const messages = draft.messages?.docs ?? [];
    messages.unshift(newMessage);

    draft.messages = {
      docs: messages,
      totalDocs: messages.length,
    };
  });
}

export function updateMessageInConversation(conversation: Conversation, newMessage: Message) {
  return produce(conversation, (draft) => {
    const messages = draft.messages?.docs ?? [];
    const messageIndex = messages.findIndex((msg) => extractID(msg) === newMessage.id);

    if (messageIndex !== -1) {
      messages[messageIndex] = newMessage;
    } else {
      messages.unshift(newMessage);
    }

    draft.messages = {
      docs: messages,
      totalDocs: messages.length,
    };
  });
}
