import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { ProfileAvatar } from '@/components/Avatar';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { useMeUser } from '@/hooks/auth/useAuth';
import { Conversation } from '@lactalink/types/payload-generated-types';
import { extractDisplayName, extractOneImageData } from '@lactalink/utilities/extractors';
import { useIsFocused } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { produce } from 'immer';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { SwipeableMethods } from 'react-native-gesture-handler/lib/typescript/components/ReanimatedSwipeable';
import { GiftedChat, User as GiftedUser, MessageProps, SendProps } from 'react-native-gifted-chat';
import { TypingIndicator } from 'react-native-gifted-chat/src/TypingIndicator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInfiniteMessages } from '../../hooks/queries';
import { useConversationChannel } from '../../hooks/realtime-channels';
import { createMarkAsReadMutation, createSendMessageMutation } from '../../lib/mutationOptions';
import { ChatMessage, CreateChatMessage } from '../../lib/types';
import ChatMessageBox from './ChatMessageBox';
import ChatSendButton from './ChatSendButton';
import MediaList from './MediaList';
import { ChatActions, ChatBubble, ChatInputToolbar, ChatSystemMessage } from './render-components';
import ReplyMessageBar from './ReplyMessageBar';
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

  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);

  const swipeableMapRef = useRef(new Map<string, SwipeableMethods>());

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
    (messages: ChatMessage[]) => {
      if (messages.length === 0) return;
      const message = messages[0]!;
      sendMessage(
        produce(message, (draft) => {
          if (replyTo)
            draft.replyTo = {
              _id: replyTo._id,
              text: replyTo.text,
              media: extractOneImageData(replyTo.media),
            };
        })
      );
      reset({ media: undefined, user: meUserGifted! });
      setReplyTo(null);
    },
    [meUserGifted, replyTo, reset, sendMessage]
  );

  const updateRowRef = useCallback((ref: SwipeableMethods | null, id: string | number) => {
    if (ref) swipeableMapRef.current.set(id.toString(), ref);
    else swipeableMapRef.current.delete(id.toString());
  }, []);

  const renderAccessory = useCallback(() => <MediaList />, []);

  const renderActions = useCallback(() => <ChatActions />, []);

  const renderMessage = useCallback(
    (props: MessageProps<ChatMessage>) => (
      <ChatMessageBox {...props} updateRowRef={updateRowRef} setReplyOnSwipeOpen={setReplyTo} />
    ),
    [updateRowRef]
  );

  const renderTypingIndicator = useCallback(() => {
    if (typingUsers.length === 0) return null;
    const typingUserProfiles = typingUsers.map((user) => user.profile).filter((p) => !!p);
    return (
      <HStack className="px-3">
        {typingUserProfiles.map((profile, index) => (
          <Box
            key={index}
            className="self-center rounded-full bg-background-50"
            style={{ padding: 2, marginLeft: index === 0 ? 0 : -10 }}
          >
            <ProfileAvatar profile={profile} size="sm" />
          </Box>
        ))}
        <TypingIndicator isTyping />
      </HStack>
    );
  }, [typingUsers]);

  const renderChatFooter = useCallback(() => {
    if (!replyTo) return null;
    return <ReplyMessageBar message={replyTo} onCancelReply={() => setReplyTo(null)} />;
  }, [replyTo]);

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
        renderMessage={renderMessage}
        renderChatFooter={renderChatFooter}
        renderTypingIndicator={renderTypingIndicator}
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
