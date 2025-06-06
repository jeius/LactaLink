import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';

import {
  BellIcon,
  HomeIcon,
  ListCheckIcon,
  type LucideIcon,
  MessageCircleIcon,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { MainTabButton } from './main-button';
import { TabButton } from './tab-button';

const icons: Record<string, LucideIcon> = {
  home: HomeIcon,
  transactions: ListCheckIcon,
  notifications: BellIcon,
  messages: MessageCircleIcon,
};

export const BottomTabBar = ({ navigation, state }: BottomTabBarProps) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const buttonWidth = dimensions.width / state.routes.length;
  const translateX = useSharedValue(buttonWidth * state.index);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setDimensions({ width, height });
  };

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  useEffect(() => {
    translateX.value = withSpring(buttonWidth * state.index, {
      damping: 20,
      stiffness: 300,
    });
  }, [state.index, buttonWidth, translateX]);

  return (
    <Box
      style={{
        position: 'absolute',
        bottom: 6,
        left: 20,
        right: 20,
        zIndex: 1,
      }}
    >
      <Box className="bg-background-0 relative rounded-3xl p-2 shadow-md">
        <HStack onLayout={onLayout} className="relative overflow-hidden rounded-2xl">
          <Box className="absolute inset-0">
            <Animated.View style={[circleStyle]}>
              <Box style={{ width: buttonWidth }} className="bg-primary-400 h-full rounded-2xl" />
            </Animated.View>
          </Box>
          {state.routes.map((route: { key: string; name: string }, index: number) => {
            const isFocused: boolean = state.index === index;
            const routeName: string = route.name.split('/')[0]!;

            const onPress: () => void = () => {
              const event: { defaultPrevented: boolean } = navigation.emit({
                type: 'tabPress',
                target: route.key,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TabButton
                key={route.key}
                isFocused={isFocused}
                onPress={onPress}
                label={routeName}
                icon={icons[routeName] || HomeIcon}
              />
            );
          })}
        </HStack>
        <Box
          className="bg-background-0 rounded-full p-1 shadow"
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            transform: [{ translateX: '-40%' }, { translateY: '-70%' }],
          }}
        >
          <MainTabButton />
        </Box>
      </Box>
    </Box>
  );
};
