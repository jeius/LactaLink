import { tva } from '@gluestack-ui/nativewind-utils/tva';
import { LucideIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Icon } from '../ui/icon';
import { Pressable } from '../ui/pressable';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

interface TabButtonProps {
  isFocused: boolean;
  onPress: () => void;
  label: string;
  icon: LucideIcon;
}

export const TabButton = ({ isFocused, onPress, label, icon }: TabButtonProps) => {
  const opacity = useSharedValue(isFocused ? 1 : 0);
  const scale = useSharedValue(isFocused ? 0.7 : 1);

  useEffect(() => {
    opacity.value = withSpring(isFocused ? 1 : 0, { damping: 20, stiffness: 120 });
    scale.value = withSpring(isFocused ? 0.7 : 1, { damping: 20, stiffness: 160 });
  }, [isFocused, opacity, scale]);

  const animateText = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const animateIcon = useAnimatedStyle(() => {
    const top = interpolate(scale.value, [1, 0.7], [9, 0]);
    return {
      transform: [{ scale: scale.value }, { translateY: top }],
    };
  });

  return (
    <Pressable className="flex-1 py-2" onPress={onPress}>
      <VStack space="xs" className="items-center">
        <Animated.View style={[animateIcon]}>
          <Icon as={icon} size="xl" className={focusedStyle({ isFocused })} />
        </Animated.View>
        <Animated.View style={[animateText]}>
          <Text size="xs" className={focusedStyle({ isFocused })}>
            {label}
          </Text>
        </Animated.View>
      </VStack>
    </Pressable>
  );
};

// Styles for focused state of the tab button
const focusedStyle = tva({
  base: 'font-JakartaMedium capitalize',
  variants: {
    isFocused: {
      true: 'text-primary-900',
    },
  },
});
