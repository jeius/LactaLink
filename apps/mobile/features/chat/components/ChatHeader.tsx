import Avatar from '@/components/Avatar';
import { HeaderBackButton } from '@/components/HeaderBackButton';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useUserPresence } from '@/hooks/live-updates/useUserPresence';
import { shadow } from '@/lib/utils/shadows';
import { CONVERSATION_TYPE } from '@lactalink/enums';
import { Conversation } from '@lactalink/types/payload-generated-types';
import { extractDisplayName } from '@lactalink/utilities/extractors';
import { formatTimeToPastLabel } from '@lactalink/utilities/formatters';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOtherUserProfile, useParticipantsProfiles } from '../hooks/useConversationProfiles';
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
  const userPresence = useUserPresence(otherUser);
  const isOnline = userPresence?.isOnline ?? false;
  const lastOnlineAt = otherUser ? userPresence?.offlineAt || userPresence?.onlineAt : null;

  return (
    <HStack
      style={[{ paddingTop: insets.top, borderBottomWidth: 1 }, shadow.sm]}
      className="items-center border-outline-200 bg-background-0 px-2"
    >
      <HeaderBackButton />
      <Pressable className="flex-row items-center gap-2 p-2">
        {isDirect ? (
          <DirectChatAvatar conversation={conversation} isOnline={isOnline} />
        ) : (
          <GChatAvatar conversation={conversation} />
        )}
        <VStack>
          {isDirect ? (
            <DirectChatTitle conversation={conversation} />
          ) : (
            <GroupChatTitle conversation={conversation} />
          )}
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

function DirectChatAvatar({ conversation, isOnline }: ChatHeaderProps & { isOnline: boolean }) {
  const { data: userProfile } = useOtherUserProfile(conversation);
  return (
    <Avatar
      profile={userProfile}
      size="md"
      showBadge={true}
      status={isOnline ? 'online' : 'offline'}
    />
  );
}

function GChatAvatar({ conversation }: ChatHeaderProps) {
  const { data: userProfiles } = useParticipantsProfiles(conversation);
  return <GroupChatAvatar avatar={conversation.avatar} participants={userProfiles || []} />;
}

function DirectChatTitle({ conversation }: ChatHeaderProps) {
  const { data: userProfile, isLoading } = useOtherUserProfile(conversation);
  if (isLoading) return <Skeleton variant="sharp" className="h-4 w-24" />;
  return <Text bold>{extractDisplayName({ profile: userProfile })}</Text>;
}

function GroupChatTitle({ conversation }: ChatHeaderProps) {
  const { data: userProfiles, isLoading } = useParticipantsProfiles(conversation);
  if (isLoading) return <Skeleton variant="sharp" className="h-4 w-24" />;
  const title = conversation.title || generateGroupName(userProfiles ?? []);
  return <Text bold>{title}</Text>;
}
