import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { NativeScrollEvent, Platform, ScrollView as RNScrollView, TextInput } from 'react-native';

import { useKeyboardHandler, useReanimatedFocusedInput } from 'react-native-keyboard-controller';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Box } from './ui/box';
import ScrollView, { ScrollViewProps } from './ui/ScrollView';
import { VStack, VStackProps } from './ui/vstack';

const OFFSET = Platform.select({ android: 42, ios: 64, default: 0 });

interface KeyboardAvoiderContextType {
  onFocus?: (id: string) => void;
  registerInput?: (id: string, ref: TextInput | null) => () => void;
}

interface KeyboardAvoiderProps extends ScrollViewProps {
  keyboardVerticalOffset?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const KeyboardAvoiderContext = createContext<KeyboardAvoiderContextType>({});

/**
 * A wrapper component that adjusts its position when the keyboard is shown, ensuring that input fields are not obscured.
 * It uses a ScrollView to allow scrolling of content when the keyboard is active.
 *
 */
export default function KeyboardAvoidingScrollView({
  children,
  keyboardVerticalOffset = 0,
  refreshing,
  onRefresh,
  ...props
}: KeyboardAvoiderProps) {
  const { height, isKeyboardShown } = useKeyboardSharedHeight(keyboardVerticalOffset + OFFSET);
  const scrollRef = useRef<RNScrollView>(null);
  const scrollEvent = useRef<NativeScrollEvent>(null);

  const { input: focusedInput } = useReanimatedFocusedInput();

  const fakeViewStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  useEffect(() => {
    if (isKeyboardShown && scrollEvent.current) {
      const currentOffset = scrollEvent.current.contentOffset.y;
      const viewportHeight = scrollEvent.current.layoutMeasurement.height;

      if (focusedInput) {
        const inputYPos = focusedInput.value?.layout.absoluteY ?? 0;
        // Check if the input is covered by the viewport
        if (inputYPos > viewportHeight) {
          const scrollToOffset = currentOffset + 10;
          scrollRef.current?.scrollTo({ y: scrollToOffset, animated: true });
        }
      }
    }
  }, [focusedInput, isKeyboardShown]);

  /**
   * @deprecated This function is a placeholder for handling focus events on input fields.
   * It currently does not perform any actions and will be removed in future releases.
   */
  const handleFocus = useCallback(() => {}, []);

  /**
   * @deprecated This function is a placeholder for registering input fields with the KeyboardAvoider context.
   * It currently does not perform any actions and will be removed in future releases.
   */
  const handleRegisterInput = useCallback(() => {
    return () => {};
  }, []);

  return (
    <KeyboardAvoiderContext.Provider
      value={{ onFocus: handleFocus, registerInput: handleRegisterInput }}
    >
      <>
        <ScrollView
          {...props}
          ref={scrollRef}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onScroll={({ nativeEvent }) => {
            scrollEvent.current = nativeEvent;
          }}
        >
          {children}
        </ScrollView>
        <Animated.View style={fakeViewStyle} />
      </>
    </KeyboardAvoiderContext.Provider>
  );
}

export const KeyboardAvoider: React.FC<
  Pick<KeyboardAvoiderProps, 'keyboardVerticalOffset'> & VStackProps
> = ({ children, keyboardVerticalOffset = 0, ...props }) => {
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

//#region Hooks

/**
 * A custom hook to access the KeyboardAvoider context, providing functions to register input fields and handle focus events.
 * @deprecated This hook is deprecated and will be removed in future releases.
 */
export const useKeyboardAvoider = () => useContext(KeyboardAvoiderContext);

function useKeyboardSharedHeight(offset: number = OFFSET) {
  const height = useSharedValue(0);
  const [isKeyboardShown, setIsKeyboardShown] = useState(false);

  useKeyboardHandler(
    {
      onMove: (e) => {
        'worklet';
        height.set(Math.max(e.height - offset, 0));
      },
      onInteractive: (e) => {
        'worklet';
        height.set(Math.max(e.height - offset, 0));
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
