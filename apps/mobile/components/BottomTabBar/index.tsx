import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';

import { shadow } from '@/lib/utils/shadows';
import { useRouter } from 'expo-router';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LogoIcon from '../icons/LogoIcon';
import { Button, ButtonIcon } from '../ui/button';
import { TabButton } from './TabButton';

const icons: Record<string, LucideIcon> = {
  home: HomeIcon,
  history: ListCheckIcon,
  notifications: BellIcon,
  messages: MessageCircleIcon,
};

export const BottomTabBar = ({ navigation, state }: BottomTabBarProps) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const insets = useSafeAreaInsets();
  const router = useRouter();

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
        paddingBottom: insets.bottom,
      }}
    >
      <Box className="bg-background-0 relative rounded-3xl p-2" style={shadow.md}>
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
                canPreventDefault: true,
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
          className="bg-background-0 rounded-full p-1"
          style={[
            {
              position: 'absolute',
              left: '50%',
              top: 0,
              transform: [{ translateX: '-40%' }, { translateY: '-70%' }],
            },
            shadow.xs,
          ]}
        >
          <Button
            size="lg"
            animateOnPress
            onPress={() => router.push('/map')}
            className="dark:bg-background-50 data-[active=true]:dark:bg-background-200 h-fit w-fit rounded-full p-3"
          >
            <ButtonIcon
              as={LogoIcon}
              width={40}
              height={40}
              className="fill-primary-0 dark:fill-primary-400"
              style={{ transform: [{ translateX: -1.25 }] }}
            />
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
