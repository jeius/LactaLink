import React, {
  ComponentProps,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  NativeScrollEvent,
  Platform,
  ScrollViewProps,
  StyleProp,
  TextInput,
  ViewStyle,
} from 'react-native';

import { ScrollView } from 'react-native-gesture-handler';
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { RefreshControl } from './RefreshControl';
import { VStack } from './ui/vstack';

const OFFSET = Platform.select({ android: 42, ios: 64, default: 0 });

interface KeyboardAvoiderContextProps {
  onFocus?: (id: string) => void;
  registerInput?: (id: string, ref: TextInput | null) => () => void;
}

const KeyboardAvoiderContext = createContext<KeyboardAvoiderContextProps>({});

export const useKeyboardAvoider = () => {
  return useContext(KeyboardAvoiderContext);
};

interface KeyboardAvoiderProps extends ComponentProps<typeof VStack> {
  keyboardVerticalOffset?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  contentContainerClassName?: ScrollViewProps['contentContainerClassName'];
  refreshing?: boolean;
  onRefresh?: () => void;
}

const KeyboardAvoidingWrapper: React.FC<KeyboardAvoiderProps> = ({
  children,
  keyboardVerticalOffset = 0,
  contentContainerClassName,
  contentContainerStyle,
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

  function handleFocus(id: string) {
    setFocusedInputID(id);
  }

  useEffect(() => {
    if (isKeyboardShown && scrollEvent.current) {
      const currentOffset = scrollEvent.current.contentOffset.y;
      const viewportHeight = scrollEvent.current.layoutMeasurement.height;

      const focusedInput = (focusedInputID && inputRefs.current[focusedInputID]) || null;

      if (focusedInput && focusedInput.isFocused()) {
        focusedInput.measureInWindow((_x, y, _width, height) => {
          const inputBottom = y + height;

          // Check if the input is covered by the viewport
          if (inputBottom > viewportHeight) {
            const scrollToOffset = currentOffset + OFFSET + (inputBottom - viewportHeight);
            scrollRef.current?.scrollTo({ y: scrollToOffset, animated: true });
          }
        });
      }
    }
  }, [focusedInputID, isKeyboardShown]);

  function unRegisterInput(id: string) {
    if (inputRefs.current[id]) {
      delete inputRefs.current[id];
    }
  }

  function handleRegisterInput(id: string, ref: TextInput | null) {
    if (ref) {
      inputRefs.current[id] = ref;
    } else {
      delete inputRefs.current[id];
    }
    return unRegisterInput.bind(null, id);
  }

  return (
    <KeyboardAvoiderContext.Provider
      value={{ onFocus: handleFocus, registerInput: handleRegisterInput }}
    >
      <VStack {...props}>
        <ScrollView
          ref={scrollRef}
          onScroll={({ nativeEvent }) => {
            scrollEvent.current = nativeEvent;
          }}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName={contentContainerClassName}
          contentContainerStyle={contentContainerStyle}
          refreshControl={
            refreshing || onRefresh ? (
              <RefreshControl refreshing={refreshing || false} onRefresh={onRefresh} />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
        <Animated.View style={fakeViewStyle} />
      </VStack>
    </KeyboardAvoiderContext.Provider>
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
