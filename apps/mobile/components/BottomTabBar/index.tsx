import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';

import { getHexColor } from '@/lib/colors';
import {
  BellIcon,
  ClipboardListIcon,
  type LucideIcon,
  MessageSquareIcon,
  NewspaperIcon,
} from 'lucide-react-native';
import { FC, useEffect, useState } from 'react';
import { LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgProps } from 'react-native-svg';
import NumberBadge from '../badges/NumberBadge';
import { useHideOnScrollAnimation, useScroll } from '../contexts/ScrollProvider';
import HomeIcon from '../icons/HomeIcon';
import { Card } from '../ui/card';
import { TabButton } from './TabButton';

type Route = {
  label: string;
  icon: LucideIcon | FC<SvgProps>;
};

const routeDetails: Record<string, Route> = {
  feed: { label: 'Feed', icon: NewspaperIcon },
  'active-transactions': { label: 'Transactions', icon: ClipboardListIcon },
  notifications: { label: 'Notifications', icon: BellIcon },
  messages: { label: 'Messages', icon: MessageSquareIcon },
};

export const BottomTabBar = ({ navigation, state, descriptors }: BottomTabBarProps) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [buttonSize, setButtonSize] = useState({ width: 0, height: 0 });
  const insets = useSafeAreaInsets();

  const { scrollValue } = useScroll();
  const containerAnimatedStyle = useHideOnScrollAnimation(scrollValue);

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
      damping: 70,
      stiffness: 700,
    });
  }, [state.index, itemWidth, translateX]);

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: Math.max(insets.bottom, 12),
          left: 12,
          right: 12,
          zIndex: 1,
        },
        containerAnimatedStyle,
      ]}
    >
      <Card className="relative rounded-full p-1">
        <HStack onLayout={onItemLayout} className="relative w-full overflow-hidden rounded-full">
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

          {state.routes.map((route, index: number) => {
            const isFocused: boolean = state.index === index;
            const routeName: string = route.name.split('/')[0]!;
            const badge = descriptors[route.key]?.options.tabBarBadge;

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
              <Box key={route.key} className="relative flex-1">
                <TabButton
                  isFocused={isFocused}
                  onPress={onPress}
                  label={routeDetails[routeName]?.label || 'Home'}
                  icon={routeDetails[routeName]?.icon || HomeIcon}
                  onIconLayout={onButtonLayout}
                  className="mx-auto"
                />
                {badge !== undefined && (
                  <NumberBadge
                    className="absolute right-3 top-0"
                    count={Number(badge)}
                    variant="primary-light"
                  />
                )}
              </Box>
            );
          })}
        </HStack>
      </Card>
    </Animated.View>
  );
};
