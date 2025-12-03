import { mutationOptions } from '@tanstack/react-query';
import { produce } from 'immer';
import { createGroupChat } from './createChat';
import { conversationsInfiniteOptions } from './queryOptions';

export function createGroupChatCreationOptions() {
  return mutationOptions({
    mutationKey: ['create-group-chat'],
    mutationFn: createGroupChat,
    onSuccess: (data, _vars, _ctx, { client }) => {
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
    },
  });
}
