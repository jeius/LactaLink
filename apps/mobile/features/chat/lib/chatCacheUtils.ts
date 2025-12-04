import { Conversation } from '@lactalink/types/payload-generated-types';
import { QueryClient } from '@tanstack/react-query';
import { produce } from 'immer';
import { conversationsInfiniteOptions } from './queryOptions';

export function addConversationToCache(client: QueryClient, data: Conversation) {
  const queryKey = conversationsInfiniteOptions.queryKey;
  client.setQueryData(queryKey, (oldData) => {
    if (!oldData) return oldData;
    return produce(oldData, (draft) => {
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
