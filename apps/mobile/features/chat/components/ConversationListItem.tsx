import { ProfileAvatar } from '@/components/Avatar';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { CONVERSATION_TYPE } from '@lactalink/enums';
import { Conversation } from '@lactalink/types/payload-generated-types';
import {
  extractCollection,
  extractDisplayName,
  extractName,
} from '@lactalink/utilities/extractors';
import { formatTimeOrDateLabel } from '@lactalink/utilities/formatters';
import { useRecyclingState } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { generateGroupName } from '../lib/generateGroupName';
import { getOtherUserFromDirectChat } from '../lib/getOtherUserFromDirectChat';
import { extractLastMessage } from '../lib/transformUtils';
import GroupChatAvatar from './GroupChatAvatar';

const messageStyle = tva({
  base: 'flex-1 text-typography-700',
  variants: {
    isUnread: {
      true: 'font-JakartaSemiBold text-typography-900',
      false: '',
    },
  },
});

const dateStyle = tva({
  base: 'ml-1 text-typography-700',
  variants: {
    isUnread: {
      true: 'font-JakartaSemiBold text-typography-900',
      false: '',
    },
  },
});

interface ConversationListItemProps {
  data: Conversation;
}

export default function ConversationListItem({ data }: ConversationListItemProps) {
  const router = useRouter();

  const { unread, lastMessage, text: lastMessageText } = extractLastMessage(data);

  const participants = extractCollection(data.participants?.docs);

  const [isUnread, setIsUnread] = useRecyclingState(unread, [unread]);

  const handlePress = useCallback(() => {
    router.push(`/chat/${data.id}`);
    setIsUnread(false);
  }, [data.id, router, setIsUnread]);

  if (data.type === CONVERSATION_TYPE.GROUP.value) {
    const groupName = data.title || generateGroupName(participants || []);
    const createdBy = extractCollection(data.createdBy);
    const createdByName = (createdBy && extractName(createdBy)) || 'Someone';
    return (
      <Pressable className="w-full flex-row items-center gap-3 px-5 py-2" onPress={handlePress}>
        <GroupChatAvatar avatar={data.avatar} participants={participants || []} />
        <VStack className="flex-1">
          <Text className="font-JakartaSemiBold">{groupName}</Text>
          <HStack space="sm" className="items-center">
            <Text size="sm" numberOfLines={1} className={messageStyle({ isUnread })}>
              {lastMessageText || `${createdByName} created the group`}
            </Text>
            <Text size="sm" className={dateStyle({ isUnread })}>
              {formatTimeOrDateLabel(lastMessage?.createdAt || data.createdAt)}
            </Text>
          </HStack>
        </VStack>
      </Pressable>
    );
  }

  if (!lastMessage) return null;

  const otherUser = getOtherUserFromDirectChat(data);
  const otherUserName = extractDisplayName(otherUser);

  return (
    <Pressable className="w-full flex-row items-center gap-3 px-5 py-2" onPress={handlePress}>
      <ProfileAvatar profile={otherUser?.profile} style={{ width: 40, height: 40 }} />
      <VStack className="flex-1">
        <Text className="font-JakartaSemiBold">{otherUserName}</Text>
        <HStack space="sm" className="items-center">
          <Text size="sm" numberOfLines={1} className={messageStyle({ isUnread })}>
            {lastMessageText || 'No messages yet'}
          </Text>
          <Text size="sm" className={dateStyle({ isUnread })}>
            {formatTimeOrDateLabel(lastMessage.createdAt)}
          </Text>
        </HStack>
      </VStack>
    </Pressable>
  );
}
