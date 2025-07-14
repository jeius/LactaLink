import React, { ComponentProps } from 'react';
import { Platform, ScrollViewProps, StyleProp, ViewStyle } from 'react-native';

import { ScrollView } from 'react-native-gesture-handler';
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { VStack } from './ui/vstack';

const OFFSET = Platform.select({ android: 42, ios: 64, default: 0 });

interface KeyboardAvoiderProps extends ComponentProps<typeof VStack> {
  keyboardVerticalOffset?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  contentContainerClassName?: ScrollViewProps['contentContainerClassName'];
}

const KeyboardAvoidingWrapper: React.FC<KeyboardAvoiderProps> = ({
  children,
  keyboardVerticalOffset: offset = OFFSET,
  contentContainerClassName,
  contentContainerStyle,
  ...props
}) => {
  const { height } = useKeyboardSharedHeight(offset);

  const fakeViewStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return (
    <VStack {...props}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName={contentContainerClassName}
        contentContainerStyle={contentContainerStyle}
      >
        {children}
      </ScrollView>
      <Animated.View style={fakeViewStyle} />
    </VStack>
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
