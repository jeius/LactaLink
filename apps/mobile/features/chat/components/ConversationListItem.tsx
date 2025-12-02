import { ProfileAvatar } from '@/components/Avatar';
import { HStack } from '@/components/ui/hstack';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Conversation } from '@lactalink/types/payload-generated-types';
import React from 'react';
import { useMessage } from '../hooks/useMessage';

interface ConversationListItemProps {
  data: Conversation;
}

export default function ConversationListItem({ data }: ConversationListItemProps) {
  const lastMessage = data.messages?.docs?.[0];
  const { data: lastMsgDoc, ...msgQuery } = useMessage(lastMessage);
  const lastMessageText = lastMsgDoc ? lastMsgDoc.content : 'No messages yet';
  return (
    <HStack space="md" className="items-center px-5 py-2">
      <ProfileAvatar />
      <VStack className="grow">
        <Skeleton variant="sharp" className="h-6 w-40" />
        <HStack space="sm">
          {msgQuery.isLoading ? (
            <Skeleton variant="sharp" className="mt-1 h-3" />
          ) : (
            <Text size="sm" numberOfLines={1} className="text-typography-700">
              {lastMessageText}
            </Text>
          )}
        </HStack>
      </VStack>
    </HStack>
  );
}
