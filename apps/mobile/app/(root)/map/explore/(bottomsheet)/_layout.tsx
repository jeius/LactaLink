import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { MapBottomSheet } from '@/components/bottom-sheets/MapBottomSheet';
import { HeaderBackButton } from '@/components/HeaderBackButton';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField, InputIcon } from '@/components/ui/input';
import { useIsFocused } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { SearchIcon } from 'lucide-react-native';
import React from 'react';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedInput = Animated.createAnimatedComponent(Input);
const AnimatedBackButton = Animated.createAnimatedComponent(HeaderBackButton);

export default function ExploreBottomSheetLayout() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { themeColors } = useTheme();

  const snapPointProgress = useSharedValue(0);

  const animatedHeaderBGStyle = useAnimatedStyle(() => {
    const opacity = interpolate(snapPointProgress.value, [1, 2], [0, 1]);
    return { opacity };
  });

  const animatedBtnStyle = useAnimatedStyle(() => {
    const bgColor = interpolateColor(
      snapPointProgress.value,
      [1, 2],
      [themeColors.background[0]!, 'transparent']
    );
    return { backgroundColor: bgColor };
  });

  const animatedInputStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(snapPointProgress.value, [1, 2], [1, 0]);
    return { shadowOpacity };
  });

  return (
    <Box pointerEvents={isFocused ? 'box-none' : 'none'} className="flex-1 flex-col items-stretch">
      <HStack
        space="md"
        pointerEvents="box-none"
        className="items-center px-5 py-4"
        style={{ paddingTop: insets.top + 16 }}
      >
        <Animated.View className="absolute inset-0 bg-background-0" style={animatedHeaderBGStyle} />

        <AnimatedBackButton style={animatedBtnStyle} tintColor={themeColors.typography[900]} />

        <AnimatedInput
          variant="rounded"
          className="flex-1 bg-background-0 shadow-md"
          style={animatedInputStyle}
        >
          <InputIcon as={SearchIcon} className="ml-3 text-primary-500" />
          <InputField
            numberOfLines={1}
            className="grow"
            placeholder="Search donors, requesters, hospitals"
          />
        </AnimatedInput>
      </HStack>

      <MapBottomSheet snapPointProgress={snapPointProgress}>
        <Stack
          initialRouteName="(tabs)"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
      </MapBottomSheet>
    </Box>
  );
}
