import { transformToInfiniteDataMap } from '@/lib/utils/transformToInfiniteData';
import { getApiClient } from '@lactalink/api';
import { Conversation, Message, MessageAttachment } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractID } from '@lactalink/utilities/extractors';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { produce } from 'immer';

export function createMessageQueryOptions(id: Message['id'] | undefined | null, enabled = true) {
  return queryOptions({
    enabled: !!id || enabled,
    queryKey: ['messages', id],
    queryFn: () => {
      if (!id) throw new Error('Message ID is undefined');
      const apiClient = getApiClient();
      return apiClient.findByID({
        collection: 'messages',
        id,
        depth: 5,
      });
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function createMessagesQueryOptions(ids: Message['id'][] | undefined, enabled = true) {
  return queryOptions({
    enabled: !!ids || enabled,
    queryKey: ['messages', ids],
    queryFn: () => {
      if (!ids || ids.length === 0) throw new Error('Message IDs are undefined');
      const apiClient = getApiClient();
      return apiClient.find({
        collection: 'messages',
        where: { id: { in: ids } },
        sort: '-createdAt',
        depth: 5,
        pagination: false,
      });
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function createInfiniteMessagesOptions(conversation: Conversation | undefined) {
  const conversationID = extractID(conversation);
  const initialMessages = extractCollection(conversation)?.messages;

  return infiniteQueryOptions({
    enabled: !!conversationID,
    initialPageParam: 1,
    queryKey: ['messages', 'infinite', conversationID],
    queryFn: async ({ pageParam }) => {
      if (!conversationID) throw new Error('Conversation ID is undefined');

      const apiClient = getApiClient();
      const { docs: messages, ...rest } = await apiClient.find({
        trash: true,
        collection: 'messages',
        where: { conversation: { equals: conversationID } },
        sort: '-createdAt',
        depth: 3,
        pagination: true,
        page: pageParam,
        limit: initialMessages?.docs?.length || 15,
        joins: {
          attachments: { count: true },
          reads: { count: true },
        },
      });

      const attachments = messages.flatMap((msg) => {
        const attachments = extractCollection(msg.attachments?.docs) ?? [];
        return attachments
          .filter((att) => att.attachment.relationTo === 'message-media')
          .map((att) => [extractID(att.attachment.value), att] as [string, MessageAttachment]);
      });

      const attachmentsMap = new Map(attachments);

      const messageMedia = await apiClient.find({
        collection: 'message-media',
        where: { id: { in: Array.from(attachmentsMap.keys()) } },
        depth: 3,
        pagination: false,
      });

      const docMap = new Map(messages.map((msg) => [msg.id, msg]));

      for (const media of messageMedia) {
        const attachment = attachmentsMap.get(media.id);
        if (!attachment) continue;

        const updatedAttachment = produce(attachment, (draft) => {
          draft.attachment.value = media;
        });

        const message = docMap.get(extractID(updatedAttachment.message));
        if (!message) continue;

        const updatedMessage = produce(message, (draft) => {
          const attachments = extractCollection(draft.attachments?.docs) ?? [];

          const existingIndex = attachments.findIndex((att) => att.id === updatedAttachment.id);

          if (existingIndex > -1) {
            attachments[existingIndex] = updatedAttachment;
          } else {
            attachments.push(updatedAttachment);
          }

          draft.attachments = {
            docs: attachments,
            totalDocs: attachments.length,
          };
        });

        docMap.set(updatedMessage.id, updatedMessage);
      }

      return { ...rest, docs: docMap };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    getPreviousPageParam: (firstPage) => firstPage.prevPage,
    placeholderData: (prevData) => {
      if (!prevData) return transformToInfiniteDataMap(initialMessages);
      return prevData;
    },
    staleTime: 1000 * 60 * 1, // 1 minute
  });
}
