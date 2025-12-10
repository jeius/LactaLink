import { ProfileAvatar } from '@/components/Avatar';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
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
import { Trash2Icon } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';
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
  const [isUnread, setIsUnread] = useRecyclingState(unread, [unread]);

  const participants = extractCollection(data.participants?.docs);
  const isDirectChat = data.type === CONVERSATION_TYPE.DIRECT.value;
  const isGroupChat = data.type === CONVERSATION_TYPE.GROUP.value;

  const { title, subtitle } = useMemo(() => {
    if (isDirectChat) {
      const otherUser = getOtherUserFromDirectChat(data);
      const otherUserName = extractDisplayName(otherUser);
      return {
        title: otherUserName,
        subtitle: lastMessageText || 'No messages yet',
      };
    }

    const groupName = data.title || generateGroupName(participants || []);
    const createdBy = extractCollection(data.createdBy);
    const createdByName = (createdBy && extractName(createdBy)) || 'Someone';
    return {
      title: groupName,
      subtitle: lastMessageText || `${createdByName} created the group`,
    };
  }, [data, isDirectChat, lastMessageText, participants]);

  const AvatarComponent = useCallback(() => {
    if (isGroupChat) {
      return <GroupChatAvatar avatar={data.avatar} participants={participants || []} />;
    }
    const otherUser = getOtherUserFromDirectChat(data);
    return <ProfileAvatar profile={otherUser.profile} style={{ width: 40, height: 40 }} />;
  }, [data, isGroupChat, participants]);

  const renderRightActions = useCallback((progress: SharedValue<number>) => {
    return <Actions progress={progress} />;
  }, []);

  useEffect(() => {
    setIsUnread(unread);
  }, [unread, setIsUnread]);

  const handlePress = useCallback(() => {
    router.push(`/chat/${data.id}`);
    setIsUnread(false);
  }, [data.id, router, setIsUnread]);

  // Don't render direct chats with no messages
  if (isDirectChat && !lastMessage) return null;

  return (
    <GestureHandlerRootView>
      <ReanimatedSwipeable overshootRight={false} renderRightActions={renderRightActions}>
        <Pressable
          className="w-full flex-row items-center gap-3 bg-background-50 px-5 py-2"
          onPress={handlePress}
        >
          <AvatarComponent />
          <VStack className="flex-1">
            <Text className="font-JakartaSemiBold">{title}</Text>
            <HStack space="sm" className="items-center">
              <Text size="sm" numberOfLines={1} className={messageStyle({ isUnread })}>
                {subtitle}
              </Text>
              <Text size="sm" className={dateStyle({ isUnread })}>
                {formatTimeOrDateLabel(lastMessage?.createdAt || data.createdAt)}
              </Text>
            </HStack>
          </VStack>
        </Pressable>
      </ReanimatedSwipeable>
    </GestureHandlerRootView>
  );
}

function Actions({ progress }: { progress: SharedValue<number> }) {
  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [0.5, 1]);
    return { transform: [{ scale }] };
  });

  return (
    <Animated.View className="flex-row items-center px-2" style={animatedStyle}>
      <Pressable className="p-2">
        <Icon as={Trash2Icon} className="text-error-500" />
      </Pressable>
    </Animated.View>
  );
}
