import Avatar from '@/components/Avatar';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable, PressableProps } from '@/components/ui/pressable';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useUserPresence } from '@/hooks/live-updates/useUserPresence';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { CONVERSATION_TYPE } from '@lactalink/enums';
import { Conversation, Message } from '@lactalink/types/payload-generated-types';
import { extractDisplayName } from '@lactalink/utilities/extractors';
import { formatTimeOrDateLabel } from '@lactalink/utilities/formatters';
import { useRecyclingState } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Trash2Icon } from 'lucide-react-native';
import { ReactNode, useCallback, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { useDeleteConversation } from '../hooks/mutations';
import { useOtherUserProfile, useParticipantsProfiles } from '../hooks/useConversationProfiles';
import { generateGroupName } from '../lib/generateGroupName';
import { getOtherUserFromDirectChat } from '../lib/getOtherUserFromDirectChat';
import { getLastMessage } from '../lib/transformUtils';
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

type ActionsProps = {
  progress: SharedValue<number>;
  onDelete: () => void;
  isDeleting: boolean;
};

interface ConversationListItemProps {
  data: Conversation;
}

export default function ConversationListItem({ data }: ConversationListItemProps) {
  const router = useRouter();

  const { unread, lastMessage, text: lastMessageText } = getLastMessage(data);
  const [isUnread, setIsUnread] = useRecyclingState(unread, [unread]);

  const isDirectChat = data.type === CONVERSATION_TYPE.DIRECT.value;

  useEffect(() => {
    setIsUnread(unread);
  }, [unread, setIsUnread]);

  const handlePress = useCallback(() => {
    router.push(`/chat/${data.id}`);
    setIsUnread(false);
  }, [data.id, router, setIsUnread]);

  // Don't render direct chats with no messages
  if (isDirectChat && !lastMessage) return null;

  const ItemComp = isDirectChat ? DirectChatListItem : GroupChatListItem;
  return (
    <ItemComp
      conversation={data}
      onPress={handlePress}
      isUnread={isUnread}
      lastMessage={lastMessage}
      lastMessageText={lastMessageText}
    />
  );
}

function Actions({ progress, onDelete, isDeleting }: ActionsProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [0.5, 1]);
    return { transform: [{ scale }] };
  });

  return (
    <Animated.View className="flex-row items-center px-2" style={animatedStyle}>
      <Pressable className="p-2" onPress={onDelete}>
        {isDeleting ? (
          <Spinner size={'small'} className="text-error-500" />
        ) : (
          <Icon as={Trash2Icon} className="text-error-500" />
        )}
      </Pressable>
    </Animated.View>
  );
}

type ListItemProps = Pick<PressableProps, 'onPress'> & {
  title: string;
  subtitle: string;
  lastMessage: Message | null;
  isUnread: boolean;
  avatarComponent: ReactNode;
  conversation: Conversation;
};

function ListItem({
  title,
  subtitle,
  lastMessage,
  isUnread,
  onPress,
  avatarComponent,
  conversation: data,
}: ListItemProps) {
  const { mutate: deleteConvo, isPending: isDeleting } = useDeleteConversation(data);

  return (
    <GestureHandlerRootView>
      <ReanimatedSwipeable
        overshootRight={false}
        renderRightActions={(progress: SharedValue<number>) => {
          return <Actions progress={progress} onDelete={deleteConvo} isDeleting={isDeleting} />;
        }}
      >
        <Pressable
          className="w-full flex-row items-center gap-2 bg-background-50 px-5 py-2"
          onPress={onPress}
        >
          {avatarComponent}
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

function ItemSkeleton() {
  return (
    <HStack space="sm" className="items-center px-5 py-2">
      <Skeleton variant="circular" className="h-12 w-12" />
      <VStack className="flex-1">
        <Skeleton variant="sharp" className="mb-1 h-4 w-1/2" />
        <Skeleton variant="sharp" className="h-3 w-3/4" />
      </VStack>
    </HStack>
  );
}

type ChatListItemProps = {
  conversation: Conversation;
  onPress: () => void;
  isUnread: boolean;
  lastMessage: Message | null;
  lastMessageText: string | null | undefined;
};

function DirectChatListItem({
  conversation,
  onPress,
  isUnread,
  lastMessage,
  lastMessageText,
}: ChatListItemProps) {
  const { data: userProfile, isLoading } = useOtherUserProfile(conversation);
  const otherUser = getOtherUserFromDirectChat(conversation);
  const userPresence = useUserPresence(otherUser);

  if (isLoading) return <ItemSkeleton />;

  const title = extractDisplayName({ profile: userProfile });
  const subtitle = lastMessageText || 'No messages yet';

  return (
    <ListItem
      title={title}
      subtitle={subtitle}
      conversation={conversation}
      lastMessage={lastMessage}
      isUnread={isUnread}
      onPress={onPress}
      avatarComponent={
        <Avatar
          showBadge={!!userPresence?.isOnline}
          status="online"
          profile={userProfile}
          size="md"
        />
      }
    />
  );
}

function GroupChatListItem({
  conversation,
  onPress,
  isUnread,
  lastMessage,
  lastMessageText,
}: ChatListItemProps) {
  const { data: userProfiles, isLoading } = useParticipantsProfiles(conversation);

  if (isLoading) return <ItemSkeleton />;

  const title = conversation.title || generateGroupName(userProfiles ?? []);
  const subtitle = lastMessageText || 'No messages yet';

  return (
    <ListItem
      title={title}
      subtitle={subtitle}
      conversation={conversation}
      lastMessage={lastMessage}
      isUnread={isUnread}
      onPress={onPress}
      avatarComponent={
        <GroupChatAvatar avatar={conversation.avatar} participants={userProfiles || []} />
      }
    />
  );
}
