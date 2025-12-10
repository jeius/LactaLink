import { SingleImageViewer } from '@/components/ImageViewer';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { extractImageData } from '@lactalink/utilities/extractors';
import { XIcon } from 'lucide-react-native';
import React from 'react';
import { ChatMessage } from '../../lib/types';

interface ReplyMessageBarProps {
  onCancelReply: () => void;
  message: ChatMessage;
}

export default function ReplyMessageBar({ onCancelReply, message }: ReplyMessageBarProps) {
  const messageText = message.text;
  const userName = message.user.name || 'Unknown User';
  const media = message.media?.[0];

  return (
    <HStack space="xs" className="items-stretch bg-primary-0 p-2">
      <Box className="mr-1 w-1 bg-primary-500" />
      <VStack className="flex-1">
        <Text size="sm" className="font-JakartaSemiBold text-primary-500">
          Replying to {userName}
        </Text>
        {messageText && (
          <Text className="shrink text-typography-700" numberOfLines={2}>
            {messageText}
          </Text>
        )}
        {media && (
          <SingleImageViewer image={extractImageData(media)} style={{ width: 40, height: 48 }} />
        )}
      </VStack>
      <Pressable
        onPress={onCancelReply}
        className="self-start overflow-hidden rounded-full p-2"
        hitSlop={8}
      >
        <Icon as={XIcon} className="text-primary-700" />
      </Pressable>
    </HStack>
  );
}
