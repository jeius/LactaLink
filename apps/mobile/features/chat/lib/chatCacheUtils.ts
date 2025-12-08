import { Conversation, Message } from '@lactalink/types/payload-generated-types';
import { QueryClient } from '@tanstack/react-query';
import { produce } from 'immer';
import {
  conversationsInfiniteOptions,
  createConversationQueryOptions,
  createInfiniteMessagesOptions,
} from './queryOptions';
import { addNewMessageInConversation } from './updateConversation';

export function addConversationToInfiniteCache(client: QueryClient, data: Conversation) {
  const infiniteQueryKey = conversationsInfiniteOptions.queryKey;

  // Update the infinite conversations cache
  client.setQueryData(infiniteQueryKey, (oldData) => {
    if (!oldData) return oldData;
    return produce(oldData, (draft) => {
      // Remove existing instance of the conversation if it exists
      draft.pages.forEach((page) => {
        if (page.docs.has(data.id)) {
          page.docs.delete(data.id);
          page.totalDocs -= 1;
        }
      });

      // Add the new conversation to the first page
      const firstPage = draft.pages[0];
      if (!firstPage) return;

      // Insert the new conversation at the start
      const arrayDocs = Array.from(firstPage.docs.values());
      arrayDocs.unshift(data);
      firstPage.docs = new Map(arrayDocs.map((d) => [d.id, d]));

      // Update total count
      firstPage.totalDocs += 1;
    });
  });
}

export function addConversationToCache(client: QueryClient, data: Conversation) {
  const singleQueryKey = createConversationQueryOptions(data.id).queryKey;
  // Update the single conversation cache
  client.setQueryData(singleQueryKey, data);
}

export function addConversationToAllCaches(client: QueryClient, data: Conversation) {
  addConversationToCache(client, data);
  addConversationToInfiniteCache(client, data);
}

export function updateMessageInInfiniteCache(
  client: QueryClient,
  newMessage: Message | Message[],
  conversation: Conversation
) {
  const infiniteMessagesOptions = createInfiniteMessagesOptions(conversation);

  const messages = Array.isArray(newMessage) ? newMessage : [newMessage];

  // Optimistically update the messages cache
  client.setQueryData(infiniteMessagesOptions.queryKey, (oldData) => {
    if (!oldData) return oldData;
    return produce(oldData, (draft) => {
      for (const message of messages) {
        // Find the message and replace it
        for (const page of draft.pages) {
          if (page.docs.has(message.id)) {
            page.docs = new Map(page.docs).set(message.id, message);
          }
        }
      }
    });
  });
}

export function addMessageToInfiniteCache(
  client: QueryClient,
  newMessage: Message,
  conversation: Conversation
) {
  const infiniteMessagesOptions = createInfiniteMessagesOptions(conversation);

  // Optimistically add the new message to the messages cache
  client.setQueryData(infiniteMessagesOptions.queryKey, (oldData) => {
    if (!oldData) return oldData;
    return produce(oldData, (draft) => {
      const firstPage = draft.pages[0];
      if (!firstPage) return;

      // Insert the new message at the start
      const arrayDocs = Array.from(firstPage.docs.values());
      arrayDocs.unshift(newMessage);
      firstPage.docs = new Map(arrayDocs.map((d) => [d.id, d]));

      // Update total count
      firstPage.totalDocs += 1;
    });
  });

  const updatedConversation = addNewMessageInConversation(conversation, newMessage);
  addConversationToAllCaches(client, updatedConversation);
}
