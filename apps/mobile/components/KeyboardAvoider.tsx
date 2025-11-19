import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { NativeScrollEvent, Platform, ScrollViewProps, TextInput } from 'react-native';

import { ScrollView } from 'react-native-gesture-handler';
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { RefreshControl } from './RefreshControl';
import { Box } from './ui/box';
import { VStack } from './ui/vstack';

const OFFSET = Platform.select({ android: 42, ios: 64, default: 0 });

interface KeyboardAvoiderContextProps {
  onFocus?: (id: string) => void;
  registerInput?: (id: string, ref: TextInput | null) => () => void;
}

interface KeyboardAvoiderProps extends ScrollViewProps {
  keyboardVerticalOffset?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const KeyboardAvoiderContext = createContext<KeyboardAvoiderContextProps>({});

export const useKeyboardAvoider = () => useContext(KeyboardAvoiderContext);

/**
 * A wrapper component that adjusts its position when the keyboard is shown, ensuring that input fields are not obscured.
 * It uses a ScrollView to allow scrolling of content when the keyboard is active.
 *
 */
const KeyboardAvoidingScrollView: React.FC<KeyboardAvoiderProps> = ({
  children,
  keyboardVerticalOffset = 0,
  showsVerticalScrollIndicator = false,
  refreshing,
  onRefresh,
  ...props
}) => {
  const { height, isKeyboardShown } = useKeyboardSharedHeight(keyboardVerticalOffset + OFFSET);
  const scrollRef = useRef<ScrollView>(null);
  const scrollEvent = useRef<NativeScrollEvent>(null);
  const inputRefs = useRef<Record<string, TextInput | null>>({});

  const [focusedInputID, setFocusedInputID] = useState<string | null>(null);

  const fakeViewStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  const handleFocus = useCallback((id: string) => {
    setFocusedInputID(id);
  }, []);

  const handleRegisterInput = useCallback((id: string, ref: TextInput | null) => {
    const unregister = (id: string) => {
      if (inputRefs.current[id]) {
        delete inputRefs.current[id];
      }
    };

    if (ref) {
      inputRefs.current[id] = ref;
    } else {
      unregister(id);
    }

    return () => unregister(id);
  }, []);

  // useEffect(() => {
  //   if (isKeyboardShown && scrollEvent.current) {
  //     const currentOffset = scrollEvent.current.contentOffset.y;
  //     const viewportHeight = scrollEvent.current.layoutMeasurement.height;

  //     const focusedInput = (focusedInputID && inputRefs.current[focusedInputID]) || null;

  //     if (focusedInput && focusedInput.isFocused()) {
  //       focusedInput.measureInWindow((_x, y, _width, height) => {
  //         const inputBottom = y + height;

  //         // Check if the input is covered by the viewport
  //         if (inputBottom > viewportHeight) {
  //           const scrollToOffset = currentOffset + OFFSET + (inputBottom - viewportHeight);
  //           scrollRef.current?.scrollTo({ y: scrollToOffset, animated: true });
  //         }
  //       });
  //     }
  //   }
  // }, [focusedInputID, isKeyboardShown]);

  return (
    <KeyboardAvoiderContext.Provider
      value={{ onFocus: handleFocus, registerInput: handleRegisterInput }}
    >
      <>
        <ScrollView
          {...props}
          ref={scrollRef}
          onScroll={({ nativeEvent }) => {
            scrollEvent.current = nativeEvent;
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          refreshControl={
            refreshing !== undefined || onRefresh ? (
              <RefreshControl refreshing={refreshing || false} onRefresh={onRefresh} />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
        <Animated.View style={fakeViewStyle} />
      </>
    </KeyboardAvoiderContext.Provider>
  );
};

const KeyboardAvoider: React.FC<KeyboardAvoiderProps> = ({
  children,
  keyboardVerticalOffset = 0,
  contentContainerClassName,
  contentContainerStyle,
  refreshing,
  onRefresh,
  ...props
}) => {
  const { height } = useKeyboardSharedHeight(keyboardVerticalOffset + OFFSET);
  const fakeViewStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return (
    <VStack {...props}>
      <Box>{children}</Box>
      <Animated.View style={fakeViewStyle} />
    </VStack>
  );
};

export { KeyboardAvoider };

export default KeyboardAvoidingScrollView;

function useKeyboardSharedHeight(offset: number = OFFSET) {
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
        scheduleOnRN(setIsKeyboardShown, e.progress === 1);
      },
    },
    [offset]
  );

  return { height, isKeyboardShown };
}
