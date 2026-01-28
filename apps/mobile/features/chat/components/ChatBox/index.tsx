import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { useMeUser } from '@/hooks/auth/useAuth';
import { getPrimaryColor } from '@/lib/colors';
import { createTempID } from '@/lib/utils/tempID';
import { Conversation } from '@lactalink/types/payload-generated-types';
import { extractDisplayName, extractOneImageData } from '@lactalink/utilities/extractors';
import { useIsFocused } from '@react-navigation/native';
import { produce } from 'immer';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { SwipeableMethods } from 'react-native-gesture-handler/lib/typescript/components/ReanimatedSwipeable';
import { GiftedChat, User as GiftedUser, MessageProps, SendProps } from 'react-native-gifted-chat';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMarkReadConversation, useSendMessage } from '../../hooks/mutations';
import { useInfiniteMessages } from '../../hooks/queries';
import { ChatMessage, CreateChatMessage } from '../../lib/types';
import { useTypingUsers } from '../context';
import ChatMessageBox from './ChatMessageBox';
import ChatSendButton from './ChatSendButton';
import MediaList from './MediaList';
import {
  ChatActions,
  ChatBubble,
  ChatInputToolbar,
  ChatScrollToBottom,
  ChatSystemMessage,
  ChatTypingIndicator,
} from './render-components';
import ReplyMessageBar from './ReplyMessageBar';
import styles from './styles';

interface ChatBoxProps {
  conversation: Conversation;
}

const MemoizedChatMessageBox = React.memo(ChatMessageBox);
const MemoizedChatBubble = React.memo(ChatBubble);
const MemoizedChatSystemMessage = React.memo(ChatSystemMessage);
const MemoizedChatInputToolbar = React.memo(ChatInputToolbar);
const MemoizedChatActions = React.memo(ChatActions);
const MemoizedMediaList = React.memo(MediaList);
const MemoizedChatSendButton = React.memo(ChatSendButton);
const MemoizedReplyMessageBar = React.memo(ReplyMessageBar);
const MemoizedTypingIndicator = React.memo(ChatTypingIndicator);
const MemoizedChatScrollToBottom = React.memo(ChatScrollToBottom);

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
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteMessages(conversation);

  const swipeableMapRef = useRef(new Map<string, SwipeableMethods>());

  const typingUsers = useTypingUsers();

  const { mutate: sendMessage } = useSendMessage(conversation);
  const { mutate: markAsRead } = useMarkReadConversation(conversation);

  const meUserGifted = useMemo(() => {
    if (!meUser) return;
    return { _id: meUser.id, name: extractDisplayName(meUser) } as GiftedUser;
  }, [meUser]);

  const methods = useForm<CreateChatMessage>();
  const { reset } = methods;
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);

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
      reset({ media: undefined });
      setReplyTo(null);
    },
    [replyTo, reset, sendMessage]
  );

  const updateRowRef = useCallback((ref: SwipeableMethods | null, id: string) => {
    if (ref) swipeableMapRef.current.set(id, ref);
    else swipeableMapRef.current.delete(id);
  }, []);

  useEffect(() => {
    if (messages && isFocused) markAsRead(messages);
  }, [isFocused, markAsRead, messages]);

  useEffect(() => {
    if (replyTo) {
      const swipeableRef = swipeableMapRef.current.get(replyTo._id);
      swipeableRef?.close();
    }
  }, [replyTo]);

  //#region Render Methods
  const renderChatFooter = useCallback(() => {
    if (!replyTo) return null;
    return <MemoizedReplyMessageBar message={replyTo} onCancelReply={() => setReplyTo(null)} />;
  }, [replyTo]);

  const renderScrollToBottomComponent = useCallback(() => <MemoizedChatScrollToBottom />, []);

  const renderTypingIndicator = useCallback(
    () => <MemoizedTypingIndicator typingUsers={typingUsers} />,
    [typingUsers]
  );

  const renderMessage = useCallback(
    (props: MessageProps<ChatMessage>) => (
      <MemoizedChatMessageBox
        {...props}
        updateRowRef={updateRowRef}
        setReplyOnSwipeOpen={setReplyTo}
      />
    ),
    [updateRowRef]
  );

  const renderSend = useCallback(
    (props: SendProps<ChatMessage>) => (
      <MemoizedChatSendButton {...props} conversation={conversation} />
    ),
    [conversation]
  );

  //#endregion Render Methods

  return (
    <FormProvider {...methods}>
      <GiftedChat
        colorScheme={theme}
        messages={chatMessages}
        user={meUserGifted}
        isTyping={typingUsers.length > 0}
        isUserAvatarVisible={false}
        isScrollToBottomEnabled
        onSend={handleSend}
        messageIdGenerator={createTempID}
        textInputProps={{ style: styles.input }}
        keyboardAvoidingViewProps={{ keyboardVerticalOffset }}
        messageTextProps={{ customTextStyle: styles.messageText }}
        renderSend={renderSend}
        renderMessage={renderMessage}
        renderChatFooter={renderChatFooter}
        renderTypingIndicator={renderTypingIndicator}
        scrollToBottomComponent={renderScrollToBottomComponent}
        renderBubble={MemoizedChatBubble}
        renderActions={MemoizedChatActions}
        renderAccessory={MemoizedMediaList}
        renderSystemMessage={MemoizedChatSystemMessage}
        renderInputToolbar={MemoizedChatInputToolbar}
        listProps={{
          keyExtractor: (item, idx) => `${item._id}-${idx}`,
          showsVerticalScrollIndicator: false,
        }}
        loadEarlierMessagesProps={{
          isLoading: isFetchingNextPage,
          isInfiniteScrollEnabled: true,
          isAvailable: hasNextPage,
          onPress: fetchNextPage,
          activityIndicatorColor: getPrimaryColor('500'),
          wrapperStyle: { backgroundColor: 'none' },
          activityIndicatorSize: 24,
        }}
      />
    </FormProvider>
  );
}
