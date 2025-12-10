import { ImageViewer, SingleImageViewer } from '@/components/ImageViewer';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { getColor, getPrimaryColor } from '@/lib/colors';
import { extractImageData } from '@lactalink/utilities/extractors';
import { CameraIcon, CheckCheckIcon, CheckIcon, ImageIcon } from 'lucide-react-native';
import React, { useCallback, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  Bubble,
  BubbleProps,
  Day,
  DayProps,
  InputToolbar,
  InputToolbarProps,
  MessageImageProps,
  SystemMessage,
  SystemMessageProps,
} from 'react-native-gifted-chat';
import { pickImage, takePhoto } from '../../lib/mediaUtils';
import { ChatActionType, ChatMessage, CreateChatMessage } from '../../lib/types';
import styles from './styles';

function ChatDay(props: DayProps) {
  const bgColor = getPrimaryColor('50');
  return (
    <Day
      {...props}
      wrapperStyle={{ backgroundColor: bgColor, borderRadius: 16 }}
      textStyle={[styles.dayText]}
    />
  );
}

function ChatSystemMessage(props: SystemMessageProps<ChatMessage>) {
  return (
    <SystemMessage
      {...props}
      containerStyle={{ backgroundColor: 'none', borderWidth: 0, alignItems: 'center' }}
      messageTextProps={{ customTextStyle: styles.systemText }}
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

function ChatActions() {
  const { setValue, control } = useFormContext<CreateChatMessage>();
  const media = useWatch({ name: 'media', control });

  const handleTakePhoto = useCallback(async () => {
    const captured = await takePhoto();
    if (captured) setValue('media', (media ?? []).concat(captured));
  }, [media, setValue]);

  const handlePickImage = useCallback(async () => {
    const captured = await pickImage();
    if (captured) setValue('media', (media ?? []).concat(captured));
  }, [media, setValue]);

  const actions: ChatActionType[] = useMemo(
    () => [
      { icon: CameraIcon, action: handleTakePhoto },
      { icon: ImageIcon, action: handlePickImage },
    ],
    [handlePickImage, handleTakePhoto]
  );

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
    <VStack className="items-end">
      <ChatReplyMessage {...props} />
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
    </VStack>
  );
}

function ChatReplyMessage(props: BubbleProps<ChatMessage>) {
  const replyTo = props.currentMessage.replyTo;
  if (!replyTo) return null;

  const text = replyTo.text;
  const media = replyTo.media;
  return (
    <Box
      className="rounded-xl border border-outline-200 bg-background-0 p-2"
      style={{
        opacity: 0.8,
        paddingBottom: 16,
        transform: [{ translateY: 12 }],
      }}
    >
      {text.length > 0 && <Text className="text-typography-700">{text}</Text>}
      {media && (
        <SingleImageViewer
          disabled
          image={media}
          style={{ width: 80, height: 120, borderRadius: 6, overflow: 'hidden' }}
        />
      )}
    </Box>
  );
}

export { ChatActions, ChatBubble, ChatDay, ChatInputToolbar, ChatSystemMessage };
