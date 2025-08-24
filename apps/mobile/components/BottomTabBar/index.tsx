import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';

import { getHexColor } from '@/lib/colors';
import { BellIcon, type LucideIcon, MessageCircleIcon } from 'lucide-react-native';
import { FC, useEffect, useState } from 'react';
import { LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgProps } from 'react-native-svg';
import { useHideOnScrollAnimation } from '../contexts/ScrollProvider';
import HomeIcon from '../icons/HomeIcon';
import ListIcon from '../icons/ListIcon';
import { Card } from '../ui/card';
import { TabButton } from './TabButton';

const icons: Record<string, LucideIcon | FC<SvgProps>> = {
  home: HomeIcon,
  history: ListIcon,
  notifications: BellIcon,
  messages: MessageCircleIcon,
};

export const BottomTabBar = ({ navigation, state }: BottomTabBarProps) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [buttonSize, setButtonSize] = useState({ width: 0, height: 0 });
  const insets = useSafeAreaInsets();

  const containerAnimatedStyle = useHideOnScrollAnimation();

  const itemWidth = dimensions.width / state.routes.length;
  const translateX = useSharedValue(itemWidth * state.index);

  const onItemLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setDimensions({ width, height });
  };

  const onButtonLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setButtonSize({ width, height });
  };

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  useEffect(() => {
    translateX.value = withSpring(itemWidth * state.index, {
      damping: 20,
      stiffness: 300,
    });
  }, [state.index, itemWidth, translateX]);

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: 0,
          left: 12,
          right: 12,
          zIndex: 1,
          marginBottom: insets.bottom,
        },
        containerAnimatedStyle,
      ]}
    >
      <Card className="relative overflow-visible rounded-full p-1">
        <HStack onLayout={onItemLayout} className="relative w-full rounded-full">
          <Box className="absolute inset-0">
            <Animated.View style={[circleStyle, { width: itemWidth, height: '100%' }]}>
              <Box
                style={{
                  width: buttonSize.width + 24,
                  height: buttonSize.height + 24,
                  backgroundColor: getHexColor('light', 'primary', 500),
                }}
                className="m-auto rounded-full"
              />
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
              <Box key={route.key} className="flex-1">
                <TabButton
                  isFocused={isFocused}
                  onPress={onPress}
                  label={routeName}
                  icon={icons[routeName] || HomeIcon}
                  onIconLayout={onButtonLayout}
                  className="mx-auto"
                />
              </Box>
            );
          })}
        </HStack>
      </Card>
    </Animated.View>
  );
};
