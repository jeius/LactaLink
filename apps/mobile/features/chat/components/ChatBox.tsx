import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { ImageViewer } from '@/components/ImageViewer';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Spinner } from '@/components/ui/spinner';
import { useMeUser } from '@/hooks/auth/useAuth';
import { getColor } from '@/lib/colors';
import { getMeUser } from '@/lib/stores/meUserStore';
import { createTempID } from '@/lib/utils/tempID';
import { ImageSchema } from '@lactalink/form-schemas';
import { Conversation } from '@lactalink/types/payload-generated-types';
import { extractDisplayName, extractImageData } from '@lactalink/utilities/extractors';
import { useMutation } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import {
  CameraIcon,
  CheckCheckIcon,
  CheckIcon,
  ImageIcon,
  LucideIcon,
  SendIcon,
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  Bubble,
  BubbleProps,
  GiftedChat,
  User as GiftedUser,
  InputToolbar,
  InputToolbarProps,
  MessageImageProps,
  SendProps,
} from 'react-native-gifted-chat';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInfiniteMessages } from '../hooks/queries';
import { pickImage, takePhoto } from '../lib/mediaUtils';
import { createMarkAsReadMutation, createSendMessageMutation } from '../lib/mutationOptions';
import { transformToChatMessage } from '../lib/transformUtils';
import { ChatMessage } from '../lib/types';
import MediaList from './MediaList';

type Action = { icon: LucideIcon; action: () => void };

interface ChatBoxProps {
  conversation: Conversation;
}

export default function ChatBox({ conversation }: ChatBoxProps) {
  const { data: meUser } = useMeUser();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const keyboardVerticalOffset = insets.bottom + 64;

  const {
    data: messages,
    fetchNextPage,
    isFetchingNextPage,
    ...msgQuery
  } = useInfiniteMessages(conversation);

  const chatMessages = useMemo(
    () =>
      (messages?.pages ?? []).flatMap((page) => {
        return Array.from(page.docs.values()).map(transformToChatMessage);
      }),
    [messages]
  );

  const { mutate: sendMessage } = useMutation(createSendMessageMutation(conversation));
  const { mutate: markAsRead } = useMutation(createMarkAsReadMutation(conversation));

  const [media, setMedia] = useState<ImageSchema[]>([]);
  const [text, setText] = useState('');

  const isMediaEmpty = media.length === 0;
  const meUserGifted = useMemo<GiftedUser | undefined>(() => {
    if (!meUser) return undefined;
    return { _id: meUser.id, name: extractDisplayName(meUser) };
  }, [meUser]);

  const handleTakePhoto = useCallback(async () => {
    const captured = await takePhoto();
    if (captured) setMedia((prev) => prev.concat(captured));
  }, []);

  const handlePickImage = useCallback(async () => {
    const captured = await pickImage();
    if (captured) setMedia((prev) => prev.concat(captured));
  }, []);

  const actions: Action[] = useMemo(
    () => [
      { icon: CameraIcon, action: handleTakePhoto },
      { icon: ImageIcon, action: handlePickImage },
    ],
    [handlePickImage, handleTakePhoto]
  );

  const renderAccessory = useCallback(() => {
    if (media && media.length > 0) {
      return <MediaList media={media} setMedia={setMedia} />;
    }
    return null;
  }, [media]);

  const renderActions = useCallback(() => {
    return <ChatActions actions={actions} />;
  }, [actions]);

  const renderSend = useCallback(
    ({ text }: SendProps<ChatMessage>) => {
      const disable = !text?.length && isMediaEmpty;
      const handleSend = () => {
        const newChatMessage: ChatMessage = {
          _id: createTempID(),
          text: text || '',
          createdAt: new Date(),
          pending: true,
          conversation,
          sender: getMeUser()?.profile!,
          media,
          user: meUserGifted!, // Safe since sender is always me
        };
        sendMessage(newChatMessage);
        setMedia([]);
        setText('');
      };
      return (
        <Pressable
          disabled={disable}
          className="p-2"
          style={{ marginHorizontal: 4 }}
          onPress={handleSend}
        >
          <Icon
            as={SendIcon}
            className={disable ? 'text-outline-700' : 'text-primary-500'}
            style={styles.icon}
          />
        </Pressable>
      );
    },
    [conversation, isMediaEmpty, meUserGifted, media, sendMessage]
  );

  useFocusEffect(
    useCallback(() => {
      if (messages) {
        markAsRead(messages.pages.flatMap((page) => Array.from(page.docs.values())));
      }
    }, [markAsRead, messages])
  );

  return (
    <GiftedChat
      messages={chatMessages}
      renderAccessory={renderAccessory}
      user={meUserGifted}
      isUserAvatarVisible={false}
      colorScheme={theme}
      keyboardAvoidingViewProps={{ keyboardVerticalOffset }}
      renderSend={renderSend}
      renderInputToolbar={ChatInputToolbar}
      renderBubble={ChatBubble}
      renderActions={renderActions}
      text={text}
      textInputProps={{ style: styles.input, onChangeText: setText }}
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
  );
}

function ChatInputToolbar(props: InputToolbarProps<ChatMessage>) {
  return (
    <InputToolbar
      {...props}
      containerStyle={{
        backgroundColor: getColor('background', '50'),
        borderTopWidth: 0,
        paddingHorizontal: 8,
      }}
    />
  );
}

function ChatImage({ currentMessage: { media } }: MessageImageProps<ChatMessage>) {
  if (!media || media.length === 0) return null;
  const images = extractImageData(media);
  return (
    <ImageViewer
      images={images}
      className="m-3 overflow-hidden rounded-xl"
      style={{ width: 160, height: 240 }}
      imageStyle={{ width: 160, height: 240 }}
    />
  );
}

function ChatActions({ actions }: { actions: Action[] }) {
  return (
    <HStack style={{ marginHorizontal: 4 }}>
      {actions.map(({ icon, action }, idx) => (
        <Pressable key={idx} className="overflow-hidden rounded-lg p-2" onPress={action}>
          <Icon as={icon} className="text-primary-500" style={styles.icon} />
        </Pressable>
      ))}
    </HStack>
  );
}

function ChatBubble(props: BubbleProps<ChatMessage>) {
  return (
    <Bubble
      {...props}
      textStyle={{
        right: { color: getColor('primary', '0') },
        left: { color: getColor('typography', '900') },
      }}
      wrapperStyle={{
        right: { backgroundColor: getColor('primary', '500') },
        left: { backgroundColor: getColor('background', '0') },
      }}
      renderMessageImage={ChatImage}
      renderTicks={({ pending, received, sent }) => {
        const size = 12;
        if (pending) {
          return <Spinner className="text-primary-0" size={size} style={{ marginLeft: 4 }} />;
        } else if (sent || received) {
          return (
            <Box style={{ marginLeft: 4 }}>
              <Icon
                as={sent ? CheckIcon : CheckCheckIcon}
                className="text-primary-0"
                style={{ width: size, height: size }}
              />
            </Box>
          );
        } else return null;
      }}
    />
  );
}

const styles = StyleSheet.create({
  icon: { height: 24, width: 24 },
  messageText: { fontFamily: 'Jakarta-Regular', fontSize: 14 },
  input: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 14,
    backgroundColor: getColor('background', '0'),
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    maxHeight: 240,
  },
});
