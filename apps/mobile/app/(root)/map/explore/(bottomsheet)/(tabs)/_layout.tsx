import { useTheme } from '@/components/AppProvider/ThemeProvider';
import { Icon } from '@/components/ui/icon';
import { HandBottleIcon, MilkBottlePlus2Icon } from '@/components/ui/icon/custom';
import { Pressable } from '@/components/ui/pressable';
import { shadow } from '@/lib/utils/shadows';
import { Tabs } from 'expo-router';
import React from 'react';

export default function ExploreTabLayout() {
  const { themeColors } = useTheme();

  const tabBarActiveTintColor = themeColors.primary[500];
  const tabBarInactiveTintColor = themeColors.typography[900];
  const tabBarBackgroundColor = themeColors.background[0];
  const borderColor = themeColors.outline[200];

  return (
    <Tabs
      initialRouteName="donations"
      screenOptions={{
        animation: 'shift',
        headerShown: false,
        sceneStyle: { backgroundColor: tabBarBackgroundColor },
        tabBarActiveTintColor,
        tabBarInactiveTintColor,
        tabBarStyle: {
          paddingTop: 0,
          elevation: 0,
          backgroundColor: tabBarBackgroundColor,
          height: 48,
          borderColor,
          borderBottomWidth: 1,
          ...shadow.sm,
        },
        tabBarLabelStyle: { fontSize: 14, fontFamily: 'Jakarta-SemiBold' },
        tabBarPosition: 'top',
        tabBarLabelPosition: 'beside-icon',
        tabBarButton: (props) => (
          //@ts-expect-error props.ref type mismatch
          <Pressable {...props} android_ripple={undefined} ref={props.ref} />
        ),
      }}
    >
      <Tabs.Screen
        name="donations"
        options={{
          title: 'Donations',
          tabBarLabel: 'Donations',
          tabBarIcon: ({ color }) => <Icon as={HandBottleIcon} color={color} size="xl" />,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Requests',
          tabBarLabel: 'Requests',
          tabBarIcon: ({ color }) => <Icon as={MilkBottlePlus2Icon} color={color} size="xl" />,
        }}
      />
    </Tabs>
  );
}
