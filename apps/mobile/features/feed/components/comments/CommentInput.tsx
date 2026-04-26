import { AnimatedPressable } from '@/components/animated/pressable';
import { KeyboardAvoider } from '@/components/KeyboardAvoider';
import NameLink from '@/components/NameLink';
import { Box, BoxProps } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonSpinner } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { Comment } from '@lactalink/types/payload-generated-types';
import { SendIcon, XIcon } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, TextInput, TextInputContentSizeChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const baseStyle = tva({
  base: 'absolute inset-x-0 bottom-0 bg-background-0',
});

interface CommentInputProps extends BoxProps {
  isSubmitting?: boolean;
  onSubmit?: (value: string) => Promise<void> | void;
  replyToAuthor?: Comment['author'] | null;
  onReplyCancel?: () => void;
}

const COMMENT_INPUT_HEIGHT = 40;
const MAX_COMMENT_INPUT_HEIGHT = 160;
const AnimatedInput = Animated.createAnimatedComponent(Input);

export default function CommentInput({
  style,
  className,
  onLayout,
  replyToAuthor,
  onSubmit,
  onReplyCancel,
  isSubmitting,
}: CommentInputProps) {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [value, setValue] = useState('');

  const animatedHeight = useSharedValue(COMMENT_INPUT_HEIGHT);
  const animatedInputStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
  }));

  const handleContentSizeChange = ({ nativeEvent }: TextInputContentSizeChangeEvent) => {
    const height = nativeEvent.contentSize.height;
    const newHeight = Math.min(Math.max(COMMENT_INPUT_HEIGHT, height), MAX_COMMENT_INPUT_HEIGHT);
    animatedHeight.set(withTiming(newHeight, { duration: 150 }));
  };

  const handleSubmit = async () => {
    if (!value.trim()) return;

    Keyboard.dismiss();
    await onSubmit?.(value.trim());
    inputRef.current?.clear();
    setValue('');
  };

  // Separate effect for keyboard hide listener
  useEffect(() => {
    const subscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsFocused(false);
      inputRef.current?.blur();
    });

    return () => subscription.remove();
  }, []);

  // Separate effect for focus when replying
  useEffect(() => {
    if (replyToAuthor) {
      const timeoutId = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
    return;
  }, [replyToAuthor]);

  return (
    <Box className={baseStyle({ className })} style={style} onLayout={onLayout}>
      {replyToAuthor && (
        <HStack space="xs" className="items-center bg-primary-0 px-4 py-2">
          <Text className="flex-1 text-primary-700">
            Replying to <NameLink {...replyToAuthor} className="text-primary-700" />
          </Text>
          <AnimatedPressable className="p-2" onPress={onReplyCancel}>
            <Icon as={XIcon} className="text-primary-700" />
          </AnimatedPressable>
        </HStack>
      )}
      <KeyboardAvoider
        className="border-outline-200 px-4 py-2"
        style={{ borderTopWidth: 1, paddingBottom: insets.bottom + 8 }}
      >
        <HStack space="sm" className="items-start">
          <AnimatedInput isDisabled={isSubmitting} className="flex-1" style={animatedInputStyle}>
            <InputField
              ref={inputRef}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChangeText={setValue}
              onContentSizeChange={handleContentSizeChange}
              placeholder="Write a comment..."
              multiline
              autoFocus
            />
          </AnimatedInput>
          {(isFocused || value) && (
            <Button
              variant={value ? 'solid' : 'ghost'}
              isDisabled={!value.trim()}
              pointerEvents={isSubmitting ? 'none' : 'auto'}
              className="px-4"
              style={{ height: COMMENT_INPUT_HEIGHT }}
              onPress={handleSubmit}
            >
              {isSubmitting ? <ButtonSpinner /> : <ButtonIcon as={SendIcon} />}
            </Button>
          )}
        </HStack>
      </KeyboardAvoider>
    </Box>
  );
}
