import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { Spinner } from '@/components/ui/spinner';
import { useMeUser } from '@/hooks/auth/useAuth';
import { Conversation } from '@lactalink/types/payload-generated-types';
import { extractDisplayName } from '@lactalink/utilities/extractors';
import { useIsFocused } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import React, { useCallback, useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { GiftedChat, User as GiftedUser, SendProps } from 'react-native-gifted-chat';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInfiniteMessages } from '../../hooks/queries';
import { useConversationChannel } from '../../hooks/realtime-channels';
import { createMarkAsReadMutation, createSendMessageMutation } from '../../lib/mutationOptions';
import { ChatMessage, CreateChatMessage } from '../../lib/types';
import ChatSendButton from './ChatSendButton';
import MediaList from './MediaList';
import { ChatActions, ChatBubble, ChatInputToolbar, ChatSystemMessage } from './render-components';
import styles from './styles';

interface ChatBoxProps {
  conversation: Conversation;
}

export default function ChatBox({ conversation }: ChatBoxProps) {
  const { data: meUser } = useMeUser();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const isFocused = useIsFocused();

  const keyboardVerticalOffset = insets.bottom + 64;

  const {
    chatMessages,
    data: messages,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteMessages(conversation);

  const { typingUsers } = useConversationChannel(conversation);

  const { mutate: sendMessage } = useMutation(createSendMessageMutation(conversation));
  const { mutate: markAsRead } = useMutation(createMarkAsReadMutation(conversation));

  const meUserGifted = useMemo(() => {
    if (!meUser) return;
    return { _id: meUser.id, name: extractDisplayName(meUser) } as GiftedUser;
  }, [meUser]);

  const methods = useForm<CreateChatMessage>({
    defaultValues: { user: meUserGifted! },
  });

  const { reset } = methods;

  const handleSend = useCallback(
    (message: ChatMessage[]) => {
      if (message.length === 0) return;
      sendMessage(message[0]!);
      reset({ media: undefined, user: meUserGifted! });
    },
    [meUserGifted, reset, sendMessage]
  );

  const renderAccessory = useCallback(() => <MediaList />, []);

  const renderActions = useCallback(() => <ChatActions />, []);

  const renderSend = useCallback(
    (props: SendProps<ChatMessage>) => <ChatSendButton {...props} conversation={conversation} />,
    [conversation]
  );

  useEffect(() => {
    if (messages && isFocused) markAsRead(messages);
  }, [isFocused, markAsRead, messages]);

  return (
    <FormProvider {...methods}>
      <GiftedChat
        colorScheme={theme}
        messages={chatMessages}
        user={meUserGifted}
        isTyping={typingUsers.length > 0}
        isUserAvatarVisible={false}
        onSend={handleSend}
        renderSend={renderSend}
        renderBubble={ChatBubble}
        renderActions={renderActions}
        renderAccessory={renderAccessory}
        renderSystemMessage={ChatSystemMessage}
        renderInputToolbar={ChatInputToolbar}
        textInputProps={{ style: styles.input }}
        keyboardAvoidingViewProps={{ keyboardVerticalOffset }}
        messageTextProps={{ customTextStyle: styles.messageText }}
        listProps={{
          showsVerticalScrollIndicator: false,
          onEndReached: () => fetchNextPage(),
          onEndReachedThreshold: 0.25,
          ListFooterComponent: isFetchingNextPage ? (
            <Spinner size={'small'} className="my-4" />
          ) : null,
        }}
      />
    </FormProvider>
  );
}
