import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';
import { ReplyIcon } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { ViewProps } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable, { type SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Message, MessageProps } from 'react-native-gifted-chat';

import Animated, { interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { ChatMessage } from '../../lib/types';

export type ChatMessageBoxProps = {
  setReplyOnSwipeOpen?: (message: ChatMessage) => void;
  updateRowRef: (ref: SwipeableMethods | null, id: string | number) => void;
} & MessageProps<ChatMessage>;

export default function ChatMessageBox({
  setReplyOnSwipeOpen,
  updateRowRef,
  ...props
}: ChatMessageBoxProps) {
  const ref = useRef<SwipeableMethods>(null);

  const isLeft = props.position === 'left';
  const isRight = props.position === 'right';
  const isSystemMessage = props.currentMessage?.system === true;

  const renderAction = (progress: SharedValue<number>) => {
    return (
      <ReplyAction
        progress={progress}
        translateDirection={isLeft ? 'right' : 'left'}
        style={{
          marginLeft: isLeft ? 0 : 8,
          marginRight: isRight ? 0 : 8,
        }}
      />
    );
  };

  const onSwipeOpenAction = () => {
    if (props.currentMessage) {
      setReplyOnSwipeOpen?.({ ...props.currentMessage });
      setTimeout(() => {
        ref.current?.close();
      }, 300);
    }
  };

  useEffect(() => {
    updateRowRef(ref.current, props.currentMessage._id);
  }, [props.currentMessage._id, updateRowRef]);

  return (
    <GestureHandlerRootView>
      <Swipeable
        ref={ref}
        friction={2}
        rightThreshold={isRight ? 40 : undefined}
        leftThreshold={isLeft ? 40 : undefined}
        overshootFriction={3}
        renderRightActions={isRight ? renderAction : undefined}
        renderLeftActions={isLeft ? renderAction : undefined}
        onSwipeableOpen={onSwipeOpenAction}
        enabled={!isSystemMessage}
      >
        <Message {...props} />
      </Swipeable>
    </GestureHandlerRootView>
  );
}

function ReplyAction({
  progress,
  style,
  translateDirection,
}: {
  progress: SharedValue<number>;
  style?: ViewProps['style'];
  translateDirection: 'left' | 'right';
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const size = interpolate(progress.value, [0, 1, 100], [0, 1, 1]);
    const trans = interpolate(
      progress.value,
      [0, 1, 2],
      [0, translateDirection === 'left' ? -12 : 12, translateDirection === 'left' ? -20 : 20]
    );
    return {
      transform: [{ scale: size }, { translateX: trans }],
    };
  });

  return (
    <Animated.View
      style={[{ width: 40, alignItems: 'center', justifyContent: 'center' }, animatedStyle, style]}
    >
      <Box className="rounded-full p-2">
        <Icon as={ReplyIcon} />
      </Box>
    </Animated.View>
  );
}
