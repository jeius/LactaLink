import { ProfileAvatar } from '@/components/Avatar';
import { HeaderBackButton } from '@/components/HeaderBackButton';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useUserPresence } from '@/hooks/live-updates/useUserPresence';
import { shadow } from '@/lib/utils/shadows';
import { CONVERSATION_TYPE } from '@lactalink/enums';
import { Conversation } from '@lactalink/types/payload-generated-types';
import { extractCollection, extractDisplayName } from '@lactalink/utilities/extractors';
import { formatTimeToPastLabel } from '@lactalink/utilities/formatters';
import React, { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { generateGroupName } from '../lib/generateGroupName';
import { getOtherUserFromDirectChat } from '../lib/getOtherUserFromDirectChat';
import GroupChatAvatar from './GroupChatAvatar';

interface ChatHeaderProps {
  conversation: Conversation;
}

export default function ChatHeader({ conversation }: ChatHeaderProps) {
  const insets = useSafeAreaInsets();

  const isDirect = conversation.type === CONVERSATION_TYPE.DIRECT.value;

  const otherUser = isDirect ? getOtherUserFromDirectChat(conversation) : null;
  const { isOnline, lastOnlineAt } = useUserPresence(otherUser);

  const participants = useMemo(
    () => extractCollection(conversation.participants?.docs) || [],
    [conversation]
  );

  const displayName = useMemo(() => {
    if (isDirect && otherUser) {
      return extractDisplayName(otherUser);
    } else {
      return conversation.title || generateGroupName(participants);
    }
  }, [conversation, participants, isDirect, otherUser]);

  return (
    <HStack
      style={[{ paddingTop: insets.top, borderBottomWidth: 1 }, shadow.sm]}
      className="items-center border-outline-200 bg-background-0 px-2"
    >
      <HeaderBackButton />
      <Pressable className="flex-row items-center gap-2 p-2">
        {isDirect && otherUser ? (
          <ProfileAvatar
            profile={otherUser.profile}
            size="md"
            showBadge={true}
            status={isOnline ? 'online' : 'offline'}
          />
        ) : (
          <GroupChatAvatar avatar={conversation.avatar} participants={participants} />
        )}
        <VStack>
          <Text className="font-JakartaSemiBold">{displayName}</Text>
          {isDirect &&
            (isOnline ? (
              <Text size="sm" className="text-primary-500">
                Online
              </Text>
            ) : (
              <Text size="sm" className="text-typography-700">
                {lastOnlineAt ? formatTimeToPastLabel(lastOnlineAt, 'long') : 'Offline'}
              </Text>
            ))}
        </VStack>
      </Pressable>
    </HStack>
  );
}
