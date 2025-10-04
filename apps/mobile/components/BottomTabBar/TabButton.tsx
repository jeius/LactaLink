import { LucideIcon, LucideProps } from 'lucide-react-native';
import { FC, useEffect } from 'react';
import { LayoutChangeEvent, PressableProps } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SvgProps } from 'react-native-svg';
import { useTheme } from '../AppProvider/ThemeProvider';
import { Icon } from '../ui/icon';
import { Pressable } from '../ui/pressable';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';

interface TabButtonProps extends PressableProps {
  isFocused: boolean;
  label: string;
  icon: LucideIcon | FC<LucideProps | SvgProps>;
  onIconLayout?: (e: LayoutChangeEvent) => void;
}

export const TabButton = ({ isFocused, label, icon, onIconLayout, ...props }: TabButtonProps) => {
  const { themeColors } = useTheme();
  const iconColor = isFocused ? themeColors.primary[0] : themeColors.typography[950];

  const animationProgress = useSharedValue(isFocused ? 1 : 0);

  const animateText = useAnimatedStyle(() => {
    const opacity = interpolate(animationProgress.value, [0, 1], [1, 0]);
    return { opacity };
  });

  const animateIconContainer = useAnimatedStyle(() => {
    const translateY = interpolate(animationProgress.value, [0, 1], [0, 9]);
    const scale = interpolate(animationProgress.value, [0, 1], [0.7, 1]);
    return { transform: [{ scale }, { translateY }] };
  });

  useEffect(() => {
    animationProgress.value = withTiming(isFocused ? 1 : 0, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });
  }, [animationProgress, isFocused]);

  return (
    <Pressable {...props} className="flex-1 py-2" hitSlop={{ top: 6, bottom: 6 }}>
      <VStack space="xs" className="items-center">
        <Animated.View
          onLayout={isFocused ? onIconLayout : undefined}
          style={[animateIconContainer]}
        >
          <Icon as={icon} size="xl" color={iconColor} />
        </Animated.View>

        <Animated.View style={[animateText]}>
          <Text size="xs" className="font-JakartaMedium">
            {label}
          </Text>
        </Animated.View>
      </VStack>
    </Pressable>
  );
};
