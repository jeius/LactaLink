import { ProfileAvatar } from '@/components/Avatar';
import { Image } from '@/components/Image';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useMeUser } from '@/hooks/auth/useAuth';
import { BLUR_HASH } from '@/lib/constants';
import { CONVERSATION_TYPE } from '@lactalink/enums';
import { Conversation, ConversationParticipant } from '@lactalink/types/payload-generated-types';
import {
  extractCollection,
  extractDisplayName,
  extractID,
  extractName,
} from '@lactalink/utilities/extractors';
import { formatTimeOrDateLabel } from '@lactalink/utilities/formatters';
import React from 'react';
import { useMessage } from '../hooks/queries';
import { generateGroupName } from '../lib/generateGroupName';

interface ConversationListItemProps {
  data: Conversation;
}

export default function ConversationListItem({ data }: ConversationListItemProps) {
  const { data: meUser } = useMeUser();

  const lastMessage = data.messages?.docs?.[0] ?? null;
  const { data: lastMsgDoc, ...msgQuery } = useMessage(lastMessage);

  const participants = extractCollection(data.participants?.docs);

  if (data.type === CONVERSATION_TYPE.GROUP.value) {
    const groupName = data.title || generateGroupName(participants || []);
    const createdBy = extractCollection(data.createdBy);
    const createdByName = (createdBy && extractName(createdBy)) || 'Someone';
    const lastMessageText = lastMsgDoc && lastMsgDoc.content;
    return (
      <HStack space="md" className="items-center px-5 py-2">
        <GroupChatAvatar avatar={data.avatar} participants={participants || []} />
        <VStack className="grow">
          <Text className="font-JakartaSemiBold">{groupName}</Text>
          <HStack space="sm" className="items-center">
            {msgQuery.isLoading || lastMsgDoc === undefined ? (
              <Skeleton variant="sharp" className="mt-1 h-3" />
            ) : (
              <>
                <Text size="sm" numberOfLines={1} className="grow text-typography-700">
                  {lastMessageText || `${createdByName} created the group`}
                </Text>
                <Text size="sm" className="ml-1 text-typography-700">
                  {formatTimeOrDateLabel(lastMsgDoc?.createdAt || data.createdAt)}
                </Text>
              </>
            )}
          </HStack>
        </VStack>
      </HStack>
    );
  }

  if (!lastMsgDoc) return null;

  const otherParticipant = (participants ?? []).filter(
    (p) => extractID(p.participant) !== extractID(meUser)
  )[0];

  const otherUser = extractCollection(otherParticipant?.participant);
  const otherUserName = otherUser ? extractDisplayName(otherUser) : 'Unknown User';
  const lastMessageText = lastMsgDoc && lastMsgDoc.content;

  return (
    <HStack space="md" className="items-center px-5 py-2">
      <ProfileAvatar profile={otherUser?.profile} style={{ width: 40, height: 40 }} />
      <VStack className="grow">
        <Text className="font-JakartaSemiBold">{otherUserName}</Text>
        <HStack space="sm" className="items-center">
          {msgQuery.isLoading || lastMsgDoc === undefined ? (
            <Skeleton variant="sharp" className="mt-1 h-3" />
          ) : (
            <>
              <Text size="sm" numberOfLines={1} className="grow text-typography-700">
                {lastMessageText}
              </Text>
              <Text size="sm" className="ml-1 text-typography-700">
                {formatTimeOrDateLabel(lastMsgDoc.createdAt)}
              </Text>
            </>
          )}
        </HStack>
      </VStack>
    </HStack>
  );
}

function GroupChatAvatar({
  avatar,
  participants,
  isLoading,
}: {
  avatar: Conversation['avatar'];
  participants: ConversationParticipant[];
  isLoading?: boolean;
}) {
  const avatarDoc = extractCollection(avatar);
  if (avatarDoc && avatarDoc.url) {
    return (
      <Image
        source={{ uri: avatarDoc.url }}
        placeholder={{ blurhash: avatarDoc.blurHash ?? BLUR_HASH }}
        style={{ width: 40, height: 40, borderRadius: 20 }}
      />
    );
  }

  return (
    <Box style={{ width: 40, height: 40 }}>
      {participants.slice(0, 2).map((p, index) => {
        const user = extractCollection(p.participant);
        if (!user) return null;
        return (
          <Box
            key={p.id}
            className="absolute"
            style={{
              top: index * 15,
              left: index * 15,
            }}
          >
            <ProfileAvatar profile={user.profile} size="xs" isLoading={isLoading} />
          </Box>
        );
      })}
    </Box>
  );
}
