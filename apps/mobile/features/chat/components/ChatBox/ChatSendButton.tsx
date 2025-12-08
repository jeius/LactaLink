import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { getMeUser } from '@/lib/stores/meUserStore';
import { createTempID } from '@/lib/utils/tempID';
import { Conversation } from '@lactalink/types/payload-generated-types';
import { SendIcon } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { SendProps } from 'react-native-gifted-chat';
import { ChatMessage, CreateChatMessage } from '../../lib/types';
import styles from './styles';

interface ChatSendButtonProps extends SendProps<ChatMessage> {
  conversation: Conversation;
}

export default function ChatSendButton({ text, conversation, onSend }: ChatSendButtonProps) {
  const { control, handleSubmit } = useFormContext<CreateChatMessage>();
  const media = useWatch({ control, name: 'media' });

  const disable = !text?.length && (!media || media.length === 0);

  const handleSend = useCallback(
    (data: CreateChatMessage) => {
      const meUserProfile = getMeUser()?.profile;
      if (!meUserProfile) throw new Error('User profile not found. Please setup your profile.');

      const newChatMessage: ChatMessage = {
        _id: createTempID(),
        conversation: conversation,
        createdAt: new Date(),
        sender: meUserProfile,
        text: text || '',
        pending: true,
        system: false,
        ...data,
      };

      onSend?.([newChatMessage], true);
    },
    [conversation, onSend, text]
  );

  return (
    <Pressable
      disabled={disable}
      className="p-2"
      style={{ marginHorizontal: 4 }}
      onPress={handleSubmit(handleSend)}
    >
      <Icon
        as={SendIcon}
        className={disable ? 'text-outline-700' : 'text-primary-500'}
        style={styles.icon}
      />
    </Pressable>
  );
}
