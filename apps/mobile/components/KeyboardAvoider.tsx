import React, { ComponentProps, useEffect, useRef, useState } from 'react';
import { NativeScrollEvent, Platform, ScrollViewProps, StyleProp, ViewStyle } from 'react-native';

import { ScrollView } from 'react-native-gesture-handler';
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
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
  const { height, isKeyboardShown } = useKeyboardSharedHeight(offset);
  const scrollRef = useRef<ScrollView>(null);
  const scrollEvent = useRef<NativeScrollEvent>(null);

  const fakeViewStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  useEffect(() => {
    if (isKeyboardShown && scrollRef.current && scrollEvent.current) {
      const currentOffset = scrollEvent.current.contentOffset.y;
      const viewportHeight = scrollEvent.current.layoutMeasurement.height;
      const contentHeight = scrollEvent.current.contentSize.height;

      // Calculate the bottom of the visible viewport
      const visibleBottom = currentOffset + viewportHeight;

      // Check if the current scroll offset is covered by the viewport
      if (visibleBottom < contentHeight) {
        const scrollToOffset = currentOffset + offset;
        scrollRef.current.scrollTo({ y: scrollToOffset, animated: true });
      }
    }
  }, [isKeyboardShown, offset]);

  return (
    <VStack {...props}>
      <ScrollView
        ref={scrollRef}
        onScroll={({ nativeEvent }) => {
          scrollEvent.current = nativeEvent;
        }}
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
  const [isKeyboardShown, setIsKeyboardShown] = useState(false);

  useKeyboardHandler(
    {
      onMove: (e) => {
        'worklet';
        height.value = Math.max(e.height - offset, 0);
      },
      onEnd: (e) => {
        'worklet';
        runOnJS(setIsKeyboardShown)(e.progress === 1);
      },
    },
    [offset]
  );

  return { height, isKeyboardShown };
}
