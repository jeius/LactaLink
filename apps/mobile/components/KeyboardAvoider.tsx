import React, { ComponentProps } from 'react';
import { Platform, StyleProp, ViewStyle } from 'react-native';

import { useKeyboardHandler } from 'react-native-keyboard-controller';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Box } from './ui/box';

const OFFSET = Platform.select({ android: 42, ios: 64, default: 0 });

interface KeyboardAvoiderProps extends ComponentProps<typeof Box> {
  keyboardVerticalOffset?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

const KeyboardAvoidingWrapper: React.FC<KeyboardAvoiderProps> = ({
  children,
  keyboardVerticalOffset: offset = OFFSET,
  ...props
}) => {
  const { height } = useKeyboardSharedHeight(offset);

  const fakeViewStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return (
    <Box {...props}>
      {children}
      <Animated.View style={fakeViewStyle} />
    </Box>
  );
};

export default KeyboardAvoidingWrapper;

export function useKeyboardSharedHeight(offset: number = OFFSET) {
  const height = useSharedValue(0);

  useKeyboardHandler(
    {
      onMove: (e) => {
        'worklet';
        height.value = Math.max(e.height - offset, 0);
      },
    },
    [offset]
  );

  return { height };
}
